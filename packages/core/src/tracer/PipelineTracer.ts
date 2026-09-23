import type {
  PipelineStageType,
  PipelineStageStatus,
  PipelineStageConfig,
  StepGraphConfig,
  ChoiceNodeConfig,
  ScoreNodeConfig,
  BucketNodeConfig,
  ScriptRuleNodeConfig,
} from '@scaffold/ui';
import type {
  PipelineTraceEvent,
  LLMTraceEvent,
  JevTraceEvent,
  TransformTraceEvent,
  StageExecutionState,
  PipelineSnapshot,
  PipelineTracerOptions,
  TracerListener,
} from './types';

let nextEventCounter = 0;
function generateEventId(prefix: string): string {
  nextEventCounter += 1;
  return `${prefix}-${Date.now()}-${nextEventCounter}`;
}

export class PipelineTracer {
  public readonly pipelineId: string;
  private stages: Map<string, StageExecutionState> = new Map();
  private stageOrder: string[] = [];
  private startTime: number;
  private endTime?: number;
  private listeners: Map<string, Set<TracerListener<unknown>>> = new Map();
  private maxEventsPerStage: number;

  constructor(options: PipelineTracerOptions = {}) {
    this.pipelineId = options.pipelineId || `pipeline-${Date.now()}`;
    this.startTime = Date.now();
    this.maxEventsPerStage = options.maxEventsPerStage || 1000;

    if (options.onEvent) {
      this.on('event', options.onEvent as TracerListener<unknown>);
    }
    if (options.onStageChange) {
      this.on('stageChange', options.onStageChange as TracerListener<unknown>);
    }
  }

  // ─── Event Emitter ─────────────────────────────────────────

  public on(event: 'event' | 'stageChange' | 'snapshot', listener: TracerListener<unknown>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  public off(event: 'event' | 'stageChange' | 'snapshot', listener: TracerListener<unknown>): void {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: 'event' | 'stageChange' | 'snapshot', data: unknown): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((fn) => {
        try {
          fn(data);
        } catch (err) {
          console.error(`PipelineTracer listener error on '${event}':`, err);
        }
      });
    }
  }

  // ─── Stage Lifecycle ───────────────────────────────────────

  public startStage(params: {
    id: string;
    name: string;
    type: PipelineStageType;
    itemCount?: number;
    description?: string;
    badge?: string;
  }): StageExecutionState {
    const existing = this.stages.get(params.id);
    if (existing) {
      existing.status = 'running';
      existing.startTime = Date.now();
      this.emit('stageChange', existing);
      return existing;
    }

    const stage: StageExecutionState = {
      id: params.id,
      name: params.name,
      type: params.type,
      status: 'running',
      startTime: Date.now(),
      itemCount: params.itemCount || 0,
      description: params.description,
      badge: params.badge,
      events: [],
      metrics: {
        total: params.itemCount || 0,
        processed: 0,
        passCount: 0,
        flagCount: 0,
      },
    };

    this.stages.set(params.id, stage);
    if (!this.stageOrder.includes(params.id)) {
      this.stageOrder.push(params.id);
    }

    this.emit('stageChange', stage);
    return stage;
  }

  public endStage(
    stageId: string,
    options: {
      status?: PipelineStageStatus;
      summaryMetric?: string;
      metrics?: Partial<StageExecutionState['metrics']>;
    } = {}
  ): StageExecutionState {
    const stage = this.stages.get(stageId);
    if (!stage) {
      throw new Error(`Stage '${stageId}' not found in PipelineTracer`);
    }

    stage.endTime = Date.now();
    stage.durationMs = stage.endTime - stage.startTime;
    stage.status = options.status || (stage.status === 'running' ? 'success' : stage.status);

    if (options.summaryMetric) {
      stage.summaryMetric = options.summaryMetric;
    }
    if (options.metrics) {
      stage.metrics = {
        ...stage.metrics,
        ...options.metrics,
        durationMs: stage.durationMs,
      };
    }

    this.emit('stageChange', stage);
    return stage;
  }

  public updateStageMetrics(
    stageId: string,
    metrics: Partial<NonNullable<StageExecutionState['metrics']>>
  ): void {
    const stage = this.stages.get(stageId);
    if (stage) {
      stage.metrics = {
        ...stage.metrics,
        ...metrics,
      };
      this.emit('stageChange', stage);
    }
  }

  public getStage(stageId: string): StageExecutionState | undefined {
    return this.stages.get(stageId);
  }

  public getStages(): StageExecutionState[] {
    return this.stageOrder.map((id) => this.stages.get(id)!).filter(Boolean);
  }

  // ─── Event Recording ───────────────────────────────────────

  public recordEvent<T extends PipelineTraceEvent>(
    eventData: Omit<T, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
  ): T {
    const stage = this.stages.get(eventData.stageId);
    if (!stage) {
      throw new Error(
        `Cannot record event: Stage '${eventData.stageId}' has not been started. Call tracer.startStage() first.`
      );
    }

    const event = {
      ...eventData,
      id: eventData.id || generateEventId(eventData.category),
      timestamp: eventData.timestamp || Date.now(),
    } as T;

    if (stage.events.length < this.maxEventsPerStage) {
      stage.events.push(event);
    }

    // Auto-update metrics based on event category
    if (stage.metrics) {
      stage.metrics.processed = (stage.metrics.processed || 0) + 1;
      if (event.category === 'jev') {
        const jev = event as unknown as JevTraceEvent;
        if (jev.verdict === 'valid' || jev.verdict.startsWith('clean') || jev.confidence >= 0.8) {
          stage.metrics.passCount = (stage.metrics.passCount || 0) + 1;
        } else {
          stage.metrics.flagCount = (stage.metrics.flagCount || 0) + 1;
        }
      }
    }

    this.emit('event', event);
    return event;
  }

  // ─── Execution Wrappers ────────────────────────────────────

  public async traceLLM<T>(
    stageId: string,
    options: {
      model: string;
      prompt: string | Record<string, unknown>;
      stepId?: string;
      costEstimate?: string | number;
      metadata?: Record<string, unknown>;
    },
    execute: () => Promise<{ response: T; tokenUsage?: LLMTraceEvent['tokenUsage'] }>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const { response, tokenUsage } = await execute();
      const latencyMs = Date.now() - startTime;

      this.recordEvent<LLMTraceEvent>({
        category: 'llm',
        stageId,
        stepId: options.stepId,
        model: options.model,
        prompt: options.prompt,
        response: typeof response === 'string' ? response : (response as Record<string, unknown>),
        tokenUsage,
        costEstimate: options.costEstimate,
        latencyMs,
        durationMs: latencyMs,
        status: 'success',
        metadata: options.metadata,
      });

      return response;
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      this.recordEvent<LLMTraceEvent>({
        category: 'llm',
        stageId,
        stepId: options.stepId,
        model: options.model,
        prompt: options.prompt,
        latencyMs,
        durationMs: latencyMs,
        status: 'error',
        error: errorMessage,
        metadata: options.metadata,
      });

      throw err;
    }
  }

  public async traceJev<T>(
    stageId: string,
    options: {
      type: 'choice' | 'score';
      question: string;
      stepId?: string;
      choices?: string[];
      sampleToken?: string;
      metadata?: Record<string, unknown>;
    },
    execute: () => Promise<{
      result: T;
      verdict: string;
      confidence: number;
      probabilities?: Record<string, number>;
      throughputWordsPerSec?: number;
    }>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const execResult = await execute();
      const durationMs = Date.now() - startTime;

      this.recordEvent<JevTraceEvent>({
        category: 'jev',
        stageId,
        stepId: options.stepId,
        type: options.type,
        question: options.question,
        choices: options.choices,
        sampleToken: options.sampleToken,
        verdict: execResult.verdict,
        confidence: execResult.confidence,
        probabilities: execResult.probabilities,
        throughputWordsPerSec: execResult.throughputWordsPerSec,
        durationMs,
        status: 'success',
        metadata: options.metadata,
      });

      return execResult.result;
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      this.recordEvent<JevTraceEvent>({
        category: 'jev',
        stageId,
        stepId: options.stepId,
        type: options.type,
        question: options.question,
        choices: options.choices,
        sampleToken: options.sampleToken,
        verdict: 'error',
        confidence: 0,
        durationMs,
        status: 'error',
        error: errorMessage,
        metadata: options.metadata,
      });

      throw err;
    }
  }

  public async traceTransform<T>(
    stageId: string,
    options: {
      name: string;
      inputCount: number;
      stepId?: string;
      ruleSnippet?: string;
      metadata?: Record<string, unknown>;
    },
    execute: () => Promise<{ result: T; outputCount: number; droppedCount?: number }>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const execResult = await execute();
      const durationMs = Date.now() - startTime;

      this.recordEvent<TransformTraceEvent>({
        category: 'transform',
        stageId,
        stepId: options.stepId,
        name: options.name,
        inputCount: options.inputCount,
        outputCount: execResult.outputCount,
        droppedCount: execResult.droppedCount ?? options.inputCount - execResult.outputCount,
        ruleSnippet: options.ruleSnippet,
        durationMs,
        status: 'success',
        metadata: options.metadata,
      });

      return execResult.result;
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      this.recordEvent<TransformTraceEvent>({
        category: 'transform',
        stageId,
        stepId: options.stepId,
        name: options.name,
        inputCount: options.inputCount,
        outputCount: 0,
        durationMs,
        status: 'error',
        error: errorMessage,
        metadata: options.metadata,
      });

      throw err;
    }
  }

  // ─── Snapshots & Persistence ───────────────────────────────

  public getSnapshot(): PipelineSnapshot {
    const stages = this.getStages();
    let totalEvents = 0;
    let anyError = false;
    let anyRunning = false;

    stages.forEach((s) => {
      totalEvents += s.events.length;
      if (s.status === 'error') anyError = true;
      if (s.status === 'running') anyRunning = true;
    });

    const status: PipelineStageStatus = anyError
      ? 'error'
      : anyRunning
      ? 'running'
      : 'success';

    const snapshot: PipelineSnapshot = {
      pipelineId: this.pipelineId,
      startTime: this.startTime,
      endTime: this.endTime,
      status,
      stages,
      totalEvents,
    };

    this.emit('snapshot', snapshot);
    return snapshot;
  }

  public exportJSON(indent = 2): string {
    return JSON.stringify(this.getSnapshot(), null, indent);
  }

  public importJSON(jsonString: string): void {
    const parsed: PipelineSnapshot = JSON.parse(jsonString);
    this.stages.clear();
    this.stageOrder = [];

    parsed.stages.forEach((stage) => {
      this.stages.set(stage.id, stage);
      this.stageOrder.push(stage.id);
    });

    this.startTime = parsed.startTime;
    this.endTime = parsed.endTime;
  }

  // ─── UI Adapters for @scaffold/ui ──────────────────────────

  public toPipelineStageConfigs(): PipelineStageConfig[] {
    return this.getStages().map((stage) => {
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
    });
  }

  public toStepGraphConfig(
    stageId: string,
    fallback?: Partial<StepGraphConfig>
  ): StepGraphConfig | null {
    const stage = this.stages.get(stageId);
    if (!stage) return null;

    // Collect question nodes from Jev events
    const questionNodes: Array<ChoiceNodeConfig | ScoreNodeConfig> = [];
    const jevEvents = stage.events.filter((e): e is JevTraceEvent => e.category === 'jev');

    const groupedByQuestion = new Map<string, JevTraceEvent[]>();
    jevEvents.forEach((ev) => {
      const list = groupedByQuestion.get(ev.question) || [];
      list.push(ev);
      groupedByQuestion.set(ev.question, list);
    });

    let qIdx = 1;
    groupedByQuestion.forEach((events, question) => {
      const total = events.length;
      const first = events[0];

      if (first.type === 'score') {
        questionNodes.push({
          id: `score-${qIdx}`,
          type: 'score',
          title: question,
          metricLabel: 'score',
          cutoffValue: 0.8,
          tiers: [
            { key: 'high', label: 'High Confidence', percentage: 80, count: Math.round(total * 0.8) },
            { key: 'low', label: 'Low Confidence', percentage: 20, count: Math.round(total * 0.2), isFlag: true },
          ],
        });
      } else {
        const countsByVerdict: Record<string, number> = {};
        events.forEach((e) => {
          countsByVerdict[e.verdict] = (countsByVerdict[e.verdict] || 0) + 1;
        });

        const options = Object.entries(countsByVerdict).map(([verdict, count]) => {
          const percentage = Math.round((count / (total || 1)) * 1000) / 10;
          const isFlag = verdict !== 'valid' && !verdict.startsWith('clean');
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
    const transformEvents = stage.events.filter((e): e is TransformTraceEvent => e.category === 'transform');
    let scriptNode: ScriptRuleNodeConfig | undefined = fallback?.scriptNode;

    if (!scriptNode && transformEvents.length > 0) {
      const lastTransform = transformEvents[transformEvents.length - 1];
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
    const passCount = stage.metrics?.passCount ?? stage.itemCount;
    const flagCount = stage.metrics?.flagCount ?? 0;
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
      source: fallback?.source || {
        label: `${stage.name} Inputs`,
        count: stage.itemCount,
      },
      questionNodes: questionNodes.length > 0 ? questionNodes : fallback?.questionNodes || [],
      scriptNode,
      destinationBuckets,
      ...fallback,
    };
  }
}
