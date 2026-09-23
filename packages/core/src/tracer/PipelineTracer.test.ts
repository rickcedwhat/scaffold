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
    expect(ended.summaryMetric).toBe('50k -> 2.5k words');
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
    expect(tracer2.getStages()).toHaveLength(1);
    expect(tracer2.getStage('st-1')?.name).toBe('Stage 1');
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
});
