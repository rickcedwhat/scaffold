import type {
  PipelineTracer,
  PipelineSnapshot,
  StageExecutionState,
  JevTraceEvent,
  TransformTraceEvent,
} from '@scaffold/core';
import type {
  PipelineStageConfig,
  StepGraphConfig,
  ChoiceNodeConfig,
  ScoreNodeConfig,
  BucketNodeConfig,
  ScriptRuleNodeConfig,
} from '../types';

function isPassingJevVerdict(verdict: string): boolean {
  return verdict === 'valid' || verdict.startsWith('clean');
}

/**
 * Converts a raw execution stage state into a presentation PipelineStageConfig.
 */
export function stageToPipelineStageConfig(stage: StageExecutionState): PipelineStageConfig {
  const summaryMetric =
    stage.summaryMetric ||
    (stage.metrics
      ? `${stage.metrics.passCount || 0} pass • ${stage.metrics.flagCount || 0} flag`
      : `${stage.itemCount} items`);

  return {
    id: stage.id,
    name: stage.name,
    description: stage.description,
    type: stage.type,
    status: stage.status,
    itemCount: stage.itemCount,
    badge: stage.badge || stage.type.toUpperCase(),
    summaryMetric,
    metrics: stage.metrics,
  };
}

/**
 * Converts a PipelineTracer or serialized PipelineSnapshot into a sequence of PipelineStageConfig
 * ready for rendering in Studio's PipelineGraph.
 */
export function tracerToPipelineStageConfigs(
  source: PipelineTracer | PipelineSnapshot
): PipelineStageConfig[] {
  const stages = 'getStages' in source ? source.getStages() : source.stages;
  return stages.map(stageToPipelineStageConfig);
}

/**
 * Synthesizes a visual StepGraphConfig from recorded JEV and Transform events on a stage.
 */
export function tracerToStepGraphConfig(
  source: PipelineTracer | PipelineSnapshot,
  stageId: string,
  fallback?: Partial<StepGraphConfig>
): StepGraphConfig | null {
  const stage =
    'getStage' in source
      ? source.getStage(stageId)
      : source.stages.find((s) => s.id === stageId);
  if (!stage) return null;

  // Collect question nodes from Jev events
  const questionNodes: Array<ChoiceNodeConfig | ScoreNodeConfig> = [];
  const jevEvents = stage.events.filter(
    (e): e is JevTraceEvent => e.category === 'jev' && e.status !== 'error'
  );

  const groupedByQuestion = new Map<string, JevTraceEvent[]>();
  jevEvents.forEach((ev) => {
    const key = JSON.stringify([ev.question, ev.type]);
    const list = groupedByQuestion.get(key) || [];
    list.push(ev);
    groupedByQuestion.set(key, list);
  });

  let qIdx = 1;
  groupedByQuestion.forEach((events) => {
    const total = events.length;
    const first = events[0];
    const question = first.question;

    if (first.type === 'score') {
      const cutoffValue = 0.8;
      const highConfidenceCount = events.filter((event) => event.confidence >= cutoffValue).length;
      const lowConfidenceCount = total - highConfidenceCount;
      const percentage = (count: number) =>
        total === 0 ? 0 : Math.round((count / total) * 1000) / 10;

      questionNodes.push({
        id: `score-${qIdx}`,
        type: 'score',
        title: question,
        metricLabel: 'score',
        cutoffValue,
        tiers: [
          {
            key: 'high',
            label: 'High Confidence',
            percentage: percentage(highConfidenceCount),
            count: highConfidenceCount,
          },
          {
            key: 'low',
            label: 'Low Confidence',
            percentage: percentage(lowConfidenceCount),
            count: lowConfidenceCount,
            isFlag: true,
          },
        ],
      });
    } else {
      const countsByVerdict: Record<string, number> = {};
      events.forEach((e) => {
        countsByVerdict[e.verdict] = (countsByVerdict[e.verdict] || 0) + 1;
      });

      const options = Object.entries(countsByVerdict).map(([verdict, count]) => {
        const percentage = Math.round((count / (total || 1)) * 1000) / 10;
        const isFlag = !isPassingJevVerdict(verdict);
        return {
          key: verdict,
          label: verdict,
          percentage,
          count,
          isFlag,
        };
      });

      questionNodes.push({
        id: `choice-${qIdx}`,
        type: 'choice',
        title: question,
        throughput: first.throughputWordsPerSec ? `${first.throughputWordsPerSec} w/s` : undefined,
        options,
      });
    }
    qIdx += 1;
  });

  // Check for Transform events as script node
  const transformEvents = stage.events.filter(
    (e): e is TransformTraceEvent => e.category === 'transform' && e.status === 'success'
  );
  const lastTransform = transformEvents[transformEvents.length - 1];
  let scriptNode: ScriptRuleNodeConfig | undefined = fallback?.scriptNode;

  if (!scriptNode && lastTransform) {
    scriptNode = {
      id: `script-${stage.id}`,
      type: 'script',
      title: lastTransform.name,
      codeSnippet: lastTransform.ruleSnippet || `transform(${lastTransform.name})`,
      consumedInputs: ['inputItems'],
      decisionStats: {
        primaryLabel: 'kept',
        primaryCount: lastTransform.outputCount,
        secondaryLabel: 'dropped',
        secondaryCount: lastTransform.droppedCount || 0,
      },
    };
  }

  // Default destination buckets based on pass vs flag count
  const hasOutcomeMetrics = (stage.metrics?.passCount ?? 0) + (stage.metrics?.flagCount ?? 0) > 0;
  const useTransformCounts = stage.type === 'transform' && lastTransform && !hasOutcomeMetrics;
  const passCount = useTransformCounts
    ? lastTransform.outputCount
    : stage.metrics?.passCount ?? stage.itemCount;
  const flagCount = useTransformCounts
    ? lastTransform.droppedCount ?? lastTransform.inputCount - lastTransform.outputCount
    : stage.metrics?.flagCount ?? 0;
  const totalCount = passCount + flagCount || 1;

  const destinationBuckets: BucketNodeConfig[] = fallback?.destinationBuckets || [
    {
      id: 'clean_pass',
      title: 'Clean Pass',
      count: passCount,
      percentage: Math.round((passCount / totalCount) * 1000) / 10,
      intent: 'success',
    },
    {
      id: 'flagged_queue',
      title: 'Review Queue',
      count: flagCount,
      percentage: Math.round((flagCount / totalCount) * 1000) / 10,
      intent: 'warning',
      isFlag: true,
    },
  ];

  return {
    stageId: stage.id,
    stageName: stage.name,
    stageType: stage.type,
    scriptLabel: fallback?.scriptLabel,
    source: fallback?.source || {
      label: `${stage.name} Inputs`,
      count: stage.itemCount,
    },
    questionNodes: questionNodes.length > 0 ? questionNodes : fallback?.questionNodes || [],
    scriptNode,
    destinationBuckets,
    slices: fallback?.slices,
  };
}
