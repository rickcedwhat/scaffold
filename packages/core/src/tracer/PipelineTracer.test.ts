import { describe, it, expect, vi } from 'vitest';
import { PipelineTracer } from './PipelineTracer';
import type { LLMTraceEvent, JevTraceEvent, TransformTraceEvent, CustomTraceEvent } from './types';

describe('PipelineTracer', () => {
  it('initializes with default or custom pipeline ID', () => {
    const tracer1 = new PipelineTracer();
    expect(tracer1.pipelineId).toMatch(/^pipeline-/);

    const tracer2 = new PipelineTracer({ pipelineId: 'custom-pipeline-123' });
    expect(tracer2.pipelineId).toBe('custom-pipeline-123');
  });

  it('tracks stage lifecycle and metrics', () => {
    const tracer = new PipelineTracer({ pipelineId: 'polyglot-test' });

    // Start stage
    const stage = tracer.startStage({
      id: 'stage-1',
      name: 'Wordlist Ingest',
      type: 'transform',
      itemCount: 50000,
      description: 'Filters frequency list',
    });

    expect(stage.id).toBe('stage-1');
    expect(stage.status).toBe('running');
    expect(stage.itemCount).toBe(50000);
    expect(tracer.getStage('stage-1')).toBe(stage);

    // Update metrics
    tracer.updateStageMetrics('stage-1', {
      processed: 50000,
      passCount: 2500,
      flagCount: 47500,
    });

    expect(stage.metrics?.passCount).toBe(2500);

    // End stage
    const ended = tracer.endStage('stage-1', {
      status: 'success',
      summaryMetric: '50k -> 2.5k words',
    });

    expect(ended.status).toBe('success');
    expect(ended.durationMs).toBeGreaterThanOrEqual(0);
    expect(ended.metrics?.durationMs).toBe(ended.durationMs);
    expect(ended.summaryMetric).toBe('50k -> 2.5k words');
  });

  it('merges final metrics before recording the computed duration', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'stage-metrics', name: 'Metrics Stage', type: 'transform', itemCount: 5 });

    const ended = tracer.endStage('stage-metrics', {
      metrics: { processed: 4, durationMs: 999 },
    });

    expect(ended.metrics).toMatchObject({
      total: 5,
      processed: 4,
      passCount: 0,
      flagCount: 0,
      durationMs: ended.durationMs,
    });
  });

  it('records LLM, JEV, and Transform trace events', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'stage-jev', name: 'Lexical Filter', type: 'jev', itemCount: 100 });

    const jevEv = tracer.recordEvent<JevTraceEvent>({
      category: 'jev',
      stageId: 'stage-jev',
      type: 'choice',
      question: 'is_french_word',
      verdict: 'valid',
      confidence: 0.98,
      throughputWordsPerSec: 45,
      sampleToken: 'pomme',
      status: 'success',
    });

    expect(jevEv.id).toMatch(/^jev-/);
    expect(jevEv.verdict).toBe('valid');
    expect(jevEv.timestamp).toBeGreaterThan(0);

    const stage = tracer.getStage('stage-jev')!;
    expect(stage.events).toHaveLength(1);
    expect(stage.metrics?.passCount).toBe(1);
  });

  it('classifies non-error JEV verdicts consistently in metrics and graph options', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'stage-verdicts', name: 'Verdicts', type: 'jev', itemCount: 4 });

    const events = [
      { verdict: 'valid', confidence: 0.1, status: 'success' as const },
      { verdict: 'clean_match', confidence: 0.2, status: 'success' as const },
      { verdict: 'proper_noun', confidence: 0.99, status: 'success' as const },
      { verdict: 'valid', confidence: 1, status: 'error' as const },
    ];
    events.forEach((event) => {
      tracer.recordEvent<JevTraceEvent>({
        category: 'jev',
        stageId: 'stage-verdicts',
        type: 'choice',
        question: 'Lexical Validity',
        ...event,
      });
    });

    expect(tracer.getStage('stage-verdicts')?.metrics).toMatchObject({
      processed: 4,
      passCount: 2,
      flagCount: 1,
    });

    const graph = tracer.toStepGraphConfig('stage-verdicts');
    const question = graph?.questionNodes[0];
    expect(question?.type).toBe('choice');
    if (question?.type !== 'choice') throw new Error('Expected a choice node');
    expect(question.options).toEqual([
      expect.objectContaining({ key: 'valid', count: 1, isFlag: false }),
      expect.objectContaining({ key: 'clean_match', count: 1, isFlag: false }),
      expect.objectContaining({ key: 'proper_noun', count: 1, isFlag: true }),
    ]);
  });

  it('wraps and traces LLM execution with latency and token usage', async () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'stage-llm', name: 'Gemini Synth', type: 'llm', itemCount: 1 });

    const mockResult = {
      response: { definition: 'A round fruit with red or green skin.' },
      tokenUsage: { promptTokens: 35, completionTokens: 12, totalTokens: 47 },
    };

    const res = await tracer.traceLLM(
      'stage-llm',
      {
        model: 'gemini-2.5-flash',
        prompt: 'Define pomme in English',
        costEstimate: '$0.000015',
      },
      async () => mockResult
    );

    expect(res).toEqual(mockResult.response);

    const stage = tracer.getStage('stage-llm')!;
    expect(stage.events).toHaveLength(1);
    const event = stage.events[0] as LLMTraceEvent;
    expect(event.category).toBe('llm');
    expect(event.model).toBe('gemini-2.5-flash');
    expect(event.tokenUsage?.totalTokens).toBe(47);
    expect(event.status).toBe('success');
    expect(event.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('catches and records errors in traceLLM', async () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'stage-err', name: 'Faulty LLM', type: 'llm' });

    await expect(
      tracer.traceLLM(
        'stage-err',
        { model: 'gemini-2.5-flash', prompt: 'faulty call' },
        async () => {
          throw new Error('API Rate Limit Exceeded');
        }
      )
    ).rejects.toThrow('API Rate Limit Exceeded');

    const stage = tracer.getStage('stage-err')!;
    expect(stage.events).toHaveLength(1);
    const event = stage.events[0] as LLMTraceEvent;
    expect(event.status).toBe('error');
    expect(event.error).toBe('API Rate Limit Exceeded');
  });

  it('wraps and traces JEV execution', async () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 's-jev', name: 'JEV Eval', type: 'jev', itemCount: 10 });

    const res = await tracer.traceJev(
      's-jev',
      {
        type: 'choice',
        question: 'lexical_validity',
        sampleToken: 'table',
      },
      async () => ({
        result: { isWord: true },
        verdict: 'valid',
        confidence: 0.99,
        probabilities: { valid: 0.99, proper_noun: 0.01 },
        throughputWordsPerSec: 50,
      })
    );

    expect(res).toEqual({ isWord: true });

    const stage = tracer.getStage('s-jev')!;
    const ev = stage.events[0] as JevTraceEvent;
    expect(ev.category).toBe('jev');
    expect(ev.verdict).toBe('valid');
    expect(ev.confidence).toBe(0.99);
    expect(ev.throughputWordsPerSec).toBe(50);
  });

  it('wraps and traces Transform execution', async () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 's-transform', name: 'Prune Step', type: 'transform' });

    const res = await tracer.traceTransform(
      's-transform',
      {
        name: 'decideShouldRemove',
        inputCount: 2500,
        ruleSnippet: 'if (conf >= 0.70 && !valid) prune()',
      },
      async () => ({
        result: ['word1', 'word2'],
        outputCount: 2410,
        droppedCount: 90,
      })
    );

    expect(res).toEqual(['word1', 'word2']);

    const stage = tracer.getStage('s-transform')!;
    const ev = stage.events[0] as TransformTraceEvent;
    expect(ev.category).toBe('transform');
    expect(ev.inputCount).toBe(2500);
    expect(ev.outputCount).toBe(2410);
    expect(ev.droppedCount).toBe(90);
  });

  it('emits events and stage change notifications to listeners', () => {
    const eventSpy = vi.fn();
    const stageSpy = vi.fn();

    const tracer = new PipelineTracer({
      onEvent: eventSpy,
      onStageChange: stageSpy,
    });

    tracer.startStage({ id: 'stage-notify', name: 'Notify Stage', type: 'llm' });
    expect(stageSpy).toHaveBeenCalledWith(expect.objectContaining({ id: 'stage-notify' }));

    tracer.recordEvent<CustomTraceEvent>({
      category: 'custom',
      stageId: 'stage-notify',
      name: 'checkpoint',
      status: 'success',
    });
    expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({ category: 'custom' }));
  });

  it('generates snapshot and supports JSON export / import', () => {
    const tracer = new PipelineTracer({ pipelineId: 'snap-1' });
    tracer.startStage({ id: 'st-1', name: 'Stage 1', type: 'transform', itemCount: 100 });
    tracer.endStage('st-1', { status: 'success' });

    const snapshot = tracer.getSnapshot();
    expect(snapshot.pipelineId).toBe('snap-1');
    expect(snapshot.status).toBe('success');
    expect(snapshot.stages).toHaveLength(1);

    const json = tracer.exportJSON();
    expect(typeof json).toBe('string');
    expect(json).toContain('"pipelineId": "snap-1"');

    const tracer2 = new PipelineTracer({ pipelineId: 'empty' });
    tracer2.importJSON(json);
    expect(tracer2.pipelineId).toBe('snap-1');
    expect(tracer2.getStages()).toHaveLength(1);
    expect(tracer2.getStage('st-1')?.name).toBe('Stage 1');
  });

  it('returns snapshots that do not change with later stage mutations', () => {
    const tracer = new PipelineTracer();
    const snapshotSpy = vi.fn();
    tracer.on('snapshot', snapshotSpy);
    tracer.startStage({ id: 'st-copy', name: 'Snapshot Copy', type: 'transform' });
    tracer.recordEvent<CustomTraceEvent>({
      category: 'custom',
      stageId: 'st-copy',
      name: 'before-snapshot',
      status: 'success',
      payload: { nested: { value: 'original' } },
    });

    const snapshot = tracer.getSnapshot();
    const listenerSnapshot = snapshotSpy.mock.calls[0][0];
    tracer.updateStageMetrics('st-copy', { processed: 99 });
    tracer.recordEvent<CustomTraceEvent>({
      category: 'custom',
      stageId: 'st-copy',
      name: 'after-snapshot',
      status: 'success',
    });
    const liveEvent = tracer.getStage('st-copy')?.events[0] as CustomTraceEvent;
    (liveEvent.payload?.nested as { value: string }).value = 'mutated';

    expect(snapshot.stages[0].events).toHaveLength(1);
    expect(snapshot.stages[0].metrics?.processed).toBe(1);
    expect((snapshot.stages[0].events[0] as CustomTraceEvent).payload).toEqual({
      nested: { value: 'original' },
    });
    expect(listenerSnapshot).toEqual(snapshot);
  });

  it('builds score tiers from recorded confidence values', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'st-score', name: 'Score Stage', type: 'jev' });

    [0.95, 0.8, 0.79, 0.2].forEach((confidence) => {
      tracer.recordEvent<JevTraceEvent>({
        category: 'jev',
        stageId: 'st-score',
        type: 'score',
        question: 'Confidence',
        verdict: 'scored',
        confidence,
        status: 'success',
      });
    });

    const graph = tracer.toStepGraphConfig('st-score');
    const question = graph?.questionNodes[0];
    expect(question?.type).toBe('score');
    if (question?.type !== 'score') throw new Error('Expected a score node');
    expect(question.tiers).toEqual([
      { key: 'high', label: 'High Confidence', percentage: 50, count: 2 },
      { key: 'low', label: 'Low Confidence', percentage: 50, count: 2, isFlag: true },
    ]);
  });

  it('adapts state to @scaffold/ui PipelineStageConfig and StepGraphConfig', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({
      id: 'st-eval',
      name: 'Lexical Prune',
      type: 'jev',
      itemCount: 2500,
      description: 'Lexical screening',
    });

    // Record some JEV events
    tracer.recordEvent<JevTraceEvent>({
      category: 'jev',
      stageId: 'st-eval',
      type: 'choice',
      question: 'Lexical Validity',
      verdict: 'valid',
      confidence: 0.95,
      status: 'success',
    });
    tracer.recordEvent<JevTraceEvent>({
      category: 'jev',
      stageId: 'st-eval',
      type: 'choice',
      question: 'Lexical Validity',
      verdict: 'proper_noun',
      confidence: 0.85,
      status: 'success',
    });

    // Record transform
    tracer.recordEvent<TransformTraceEvent>({
      category: 'transform',
      stageId: 'st-eval',
      name: 'decideShouldRemove',
      inputCount: 2500,
      outputCount: 2410,
      droppedCount: 90,
      ruleSnippet: 'if (conf >= 0.70 && !valid) prune()',
      status: 'success',
    });

    tracer.endStage('st-eval', { status: 'success' });

    // 1. Adapter to PipelineStageConfig[]
    const stageConfigs = tracer.toPipelineStageConfigs();
    expect(stageConfigs).toHaveLength(1);
    expect(stageConfigs[0].id).toBe('st-eval');
    expect(stageConfigs[0].type).toBe('jev');
    expect(stageConfigs[0].status).toBe('success');

    // 2. Adapter to StepGraphConfig
    const stepConfig = tracer.toStepGraphConfig('st-eval');
    expect(stepConfig).not.toBeNull();
    expect(stepConfig?.stageId).toBe('st-eval');
    expect(stepConfig?.questionNodes).toHaveLength(1);
    expect(stepConfig?.questionNodes[0].title).toBe('Lexical Validity');
    expect(stepConfig?.scriptNode?.title).toBe('decideShouldRemove');
    expect(stepConfig?.destinationBuckets).toHaveLength(2);
  });

  it('does not let fallback data overwrite computed graph fields', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'st-fallback', name: 'Computed Stage', type: 'jev' });

    const graph = tracer.toStepGraphConfig('st-fallback', {
      stageId: 'fallback-id',
      stageName: 'Fallback Stage',
      stageType: 'llm',
      questionNodes: [],
    });

    expect(graph).toMatchObject({
      stageId: 'st-fallback',
      stageName: 'Computed Stage',
      stageType: 'jev',
    });
  });
});
