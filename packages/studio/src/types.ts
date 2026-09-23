/**
 * Domain-agnostic types for Pipeline & Evaluation Studio visualizers.
 */

import type { PipelineStageType, PipelineStageStatus } from '@scaffold/core';
export type { PipelineStageType, PipelineStageStatus };

export interface PipelineStageConfig {
  id: string;
  name: string;
  description?: string;
  type: PipelineStageType;
  status: PipelineStageStatus;
  itemCount: number;
  badge?: string;
  summaryMetric?: string;
  metrics?: {
    processed?: number;
    total?: number;
    passCount?: number;
    flagCount?: number;
    throughput?: string | number;
    durationMs?: number;
    costEstimate?: string;
  };
}

export interface ChoiceOptionConfig {
  key: string;
  label: string;
  percentage: number;
  count: number;
  isFlag?: boolean;
}

export interface ChoiceNodeConfig {
  id: string;
  type: 'choice';
  title: string;
  subtitle?: string;
  throughput?: string;
  options: ChoiceOptionConfig[];
}

export interface ScoreTierConfig {
  key: string;
  label: string;
  percentage: number;
  count: number;
  isFlag?: boolean;
}

export interface ScoreNodeConfig {
  id: string;
  type: 'score';
  title: string;
  subtitle?: string;
  metricLabel: string;
  cutoffValue: number | string;
  tiers: ScoreTierConfig[];
}

export interface ScriptRuleNodeConfig {
  id: string;
  type: 'script';
  title: string;
  subtitle?: string;
  filePath?: string;
  consumedInputs: string[];
  codeSnippet: string;
  ruleBadge?: string;
  fullCode?: string;
  decisionStats?: {
    primaryLabel: string;
    primaryCount: number | string;
    secondaryLabel: string;
    secondaryCount: number | string;
  };
}

export interface BucketNodeConfig {
  id: string;
  title: string;
  count: number;
  percentage: number;
  isFlag?: boolean;
  intent?: 'success' | 'warning' | 'error' | 'neutral';
  description?: string;
  subtitle?: string;
}

export interface DatasetItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  verdict: string;
  confidence?: number;
  payload?: Record<string, unknown>;
  contentPreview?: string;
  rationale?: string;
  isFlag?: boolean;
}

export interface OutcomeSlice {
  key: string;
  title: string;
  count: number;
  items: DatasetItem[];
}

export interface StepGraphConfig {
  stageId: string;
  stageName: string;
  stageType: PipelineStageType;
  scriptLabel?: string;
  source: {
    label: string;
    sublabel?: string;
    count: number;
    description?: string;
    items?: DatasetItem[];
  };
  questionNodes: Array<ChoiceNodeConfig | ScoreNodeConfig>;
  scriptNode?: ScriptRuleNodeConfig;
  destinationBuckets: BucketNodeConfig[];
  slices?: Record<string, OutcomeSlice>;
}
