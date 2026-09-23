import type {
  PipelineStageType,
  PipelineStageStatus,
} from '@scaffold/ui';

export type TracerListener<T = unknown> = (data: T) => void;

export type TraceEventCategory = 'llm' | 'jev' | 'transform' | 'custom';

export interface BaseTraceEvent {
  id: string;
  category: TraceEventCategory;
  stageId: string;
  stepId?: string;
  durationMs?: number;
  timestamp: number;
  status: 'running' | 'success' | 'error';
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface LLMTraceEvent extends BaseTraceEvent {
  category: 'llm';
  model: string;
  prompt: string | Record<string, unknown>;
  response?: string | Record<string, unknown>;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costEstimate?: string | number;
  latencyMs?: number;
}

export interface JevTraceEvent extends BaseTraceEvent {
  category: 'jev';
  type: 'choice' | 'score';
  question: string;
  choices?: string[];
  probabilities?: Record<string, number>;
  verdict: string;
  confidence: number;
  throughputWordsPerSec?: number;
  sampleToken?: string;
}

export interface TransformTraceEvent extends BaseTraceEvent {
  category: 'transform';
  name: string;
  inputCount: number;
  outputCount: number;
  droppedCount?: number;
  ruleSnippet?: string;
}

export interface CustomTraceEvent extends BaseTraceEvent {
  category: 'custom';
  name: string;
  payload?: Record<string, unknown>;
}

export type PipelineTraceEvent =
  | LLMTraceEvent
  | JevTraceEvent
  | TransformTraceEvent
  | CustomTraceEvent;

export interface StageExecutionMetrics {
  total?: number;
  processed?: number;
  passCount?: number;
  flagCount?: number;
  throughput?: string | number;
  durationMs?: number;
  costEstimate?: string;
}

export interface StageExecutionState {
  id: string;
  name: string;
  type: PipelineStageType;
  status: PipelineStageStatus;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  itemCount: number;
  events: PipelineTraceEvent[];
  metrics?: StageExecutionMetrics;
  badge?: string;
  summaryMetric?: string;
  description?: string;
}

export interface PipelineSnapshot {
  pipelineId: string;
  startTime: number;
  endTime?: number;
  status: PipelineStageStatus;
  stages: StageExecutionState[];
  totalEvents: number;
}

export interface PipelineTracerOptions {
  pipelineId?: string;
  onEvent?: (event: PipelineTraceEvent) => void;
  onStageChange?: (stage: StageExecutionState) => void;
  maxEventsPerStage?: number;
}
