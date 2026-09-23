import { describe, it, expect } from 'vitest';
import { PipelineTracer } from '@scaffold/core';
import {
  tracerToPipelineStageConfigs,
  tracerToStepGraphConfig,
  stageToPipelineStageConfig,
} from '../src';

describe('tracerAdapters in @scaffold/studio', () => {
  it('converts stage execution state into PipelineStageConfig', () => {
    const config = stageToPipelineStageConfig({
      id: 'test-stage',
      name: 'Evaluation Stage',
      type: 'jev',
      status: 'success',
      itemCount: 1500,
      badge: 'JEV EVAL',
      metrics: {
        passCount: 1400,
        flagCount: 100,
      },
      events: [],
      startTime: Date.now() - 1000,
      endTime: Date.now(),
    });

    expect(config.id).toBe('test-stage');
    expect(config.name).toBe('Evaluation Stage');
    expect(config.type).toBe('jev');
    expect(config.status).toBe('success');
    expect(config.itemCount).toBe(1500);
    expect(config.badge).toBe('JEV EVAL');
    expect(config.summaryMetric).toBe('1400 pass • 100 flag');
  });

  it('maps PipelineTracer and PipelineSnapshot to PipelineStageConfig[]', () => {
    const tracer = new PipelineTracer({ pipelineId: 'studio-adapter-test' });
    tracer.startStage({ id: 'st-1', name: 'Stage One', type: 'transform', itemCount: 100 });
    tracer.endStage('st-1', { status: 'success' });
    tracer.startStage({ id: 'st-2', name: 'Stage Two', type: 'jev', itemCount: 90 });
    tracer.endStage('st-2', { status: 'success' });

    // 1. From live tracer
    const configsFromTracer = tracerToPipelineStageConfigs(tracer);
    expect(configsFromTracer).toHaveLength(2);
    expect(configsFromTracer[0].id).toBe('st-1');
    expect(configsFromTracer[1].id).toBe('st-2');

    // 2. From snapshot
    const snapshot = tracer.getSnapshot();
    const configsFromSnapshot = tracerToPipelineStageConfigs(snapshot);
    expect(configsFromSnapshot).toEqual(configsFromTracer);
  });

  it('synthesizes StepGraphConfig from recorded JEV and Transform events', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({
      id: 'st-eval',
      name: 'Classifier Stage',
      type: 'jev',
      itemCount: 300,
      metrics: { passCount: 270, flagCount: 30 },
    });

    // Record Choice JEV event
    tracer.recordEvent({
      stageId: 'st-eval',
      category: 'jev',
      question: 'Lexical Validity',
      type: 'choice',
      probabilities: { valid: 0.95, invalid: 0.05 },
      verdict: 'valid',
      confidence: 0.95,
      throughputWordsPerSec: 50,
      status: 'success',
    });

    // Record Score JEV event
    tracer.recordEvent({
      stageId: 'st-eval',
      category: 'jev',
      question: 'Fluency Confidence',
      type: 'score',
      probabilities: { score: 0.88 },
      verdict: 'valid',
      confidence: 0.88,
      status: 'success',
    });

    // Record Transform event
    tracer.recordEvent({
      stageId: 'st-eval',
      category: 'transform',
      name: 'decideShouldRemove',
      inputCount: 300,
      outputCount: 270,
      droppedCount: 30,
      ruleSnippet: 'if (conf >= 0.70 && !valid) prune()',
      status: 'success',
    });

    tracer.updateStageMetrics('st-eval', { passCount: 270, flagCount: 30 });
    tracer.endStage('st-eval', { status: 'success' });

    // Adapter to StepGraphConfig
    const stepConfig = tracerToStepGraphConfig(tracer, 'st-eval');
    expect(stepConfig).not.toBeNull();
    expect(stepConfig?.stageId).toBe('st-eval');
    expect(stepConfig?.questionNodes).toHaveLength(2);
    expect(stepConfig?.questionNodes[0].title).toBe('Lexical Validity');
    expect(stepConfig?.questionNodes[1].title).toBe('Fluency Confidence');
    expect(stepConfig?.scriptNode?.title).toBe('decideShouldRemove');
    expect(stepConfig?.scriptNode?.codeSnippet).toBe('if (conf >= 0.70 && !valid) prune()');
    expect(stepConfig?.destinationBuckets).toHaveLength(2);
    expect(stepConfig?.destinationBuckets[0].count).toBe(270);
    expect(stepConfig?.destinationBuckets[1].count).toBe(30);

    // Also works from snapshot
    const snapshot = tracer.getSnapshot();
    const stepConfigFromSnapshot = tracerToStepGraphConfig(snapshot, 'st-eval');
    expect(stepConfigFromSnapshot).toEqual(stepConfig);
  });

  it('returns null for nonexistent stageId in tracerToStepGraphConfig', () => {
    const tracer = new PipelineTracer();
    expect(tracerToStepGraphConfig(tracer, 'missing-stage')).toBeNull();
  });

  it('builds score tiers from recorded confidence values', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'st-score', name: 'Score Stage', type: 'jev' });

    [0.95, 0.8, 0.79, 0.2].forEach((confidence) => {
      tracer.recordEvent({
        category: 'jev',
        stageId: 'st-score',
        type: 'score',
        question: 'Confidence',
        verdict: 'scored',
        confidence,
        status: 'success',
      });
    });

    const graph = tracerToStepGraphConfig(tracer, 'st-score');
    const question = graph?.questionNodes[0];
    expect(question?.type).toBe('score');
    if (question?.type !== 'score') throw new Error('Expected a score node');
    expect(question.tiers).toEqual([
      { key: 'high', label: 'High Confidence', percentage: 50, count: 2 },
      { key: 'low', label: 'Low Confidence', percentage: 50, count: 2, isFlag: true },
    ]);
  });

  it('classifies choice options and flags accurately from JEV events', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'stage-verdicts', name: 'Verdicts', type: 'jev', itemCount: 4 });

    const events = [
      { verdict: 'valid', confidence: 0.1, status: 'success' as const },
      { verdict: 'clean_match', confidence: 0.2, status: 'success' as const },
      { verdict: 'proper_noun', confidence: 0.99, status: 'success' as const },
      { verdict: 'valid', confidence: 1, status: 'error' as const },
    ];
    events.forEach((event) => {
      tracer.recordEvent({
        category: 'jev',
        stageId: 'stage-verdicts',
        type: 'choice',
        question: 'Lexical Validity',
        ...event,
      });
    });

    const graph = tracerToStepGraphConfig(tracer, 'stage-verdicts');
    const question = graph?.questionNodes[0];
    expect(question?.type).toBe('choice');
    if (question?.type !== 'choice') throw new Error('Expected a choice node');
    expect(question.options).toEqual([
      expect.objectContaining({ key: 'valid', count: 1, isFlag: false }),
      expect.objectContaining({ key: 'clean_match', count: 1, isFlag: false }),
      expect.objectContaining({ key: 'proper_noun', count: 1, isFlag: true }),
    ]);
  });

  it('groups choice and score events with the same question separately', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'mixed-jev', name: 'Mixed JEV', type: 'jev' });
    tracer.recordEvent({
      category: 'jev',
      stageId: 'mixed-jev',
      type: 'choice',
      question: 'Quality',
      verdict: 'valid',
      confidence: 0.9,
      status: 'success',
    });
    tracer.recordEvent({
      category: 'jev',
      stageId: 'mixed-jev',
      type: 'score',
      question: 'Quality',
      verdict: 'scored',
      confidence: 0.4,
      status: 'success',
    });

    const nodes = tracerToStepGraphConfig(tracer, 'mixed-jev')?.questionNodes;
    expect(nodes).toHaveLength(2);
    expect(nodes?.[0]).toMatchObject({ type: 'choice', title: 'Quality', options: [{ count: 1 }] });
    expect(nodes?.[1]).toMatchObject({
      type: 'score',
      title: 'Quality',
      tiers: [{ count: 0 }, { count: 1 }],
    });
  });

  it('uses the last successful transform and its output when stage metrics are initialized zeros', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'transform-stage', name: 'Transform', type: 'transform', itemCount: 10 });
    tracer.recordEvent({
      category: 'transform',
      stageId: 'transform-stage',
      name: 'Working script',
      inputCount: 10,
      outputCount: 7,
      droppedCount: 3,
      status: 'success',
    });
    tracer.recordEvent({
      category: 'transform',
      stageId: 'transform-stage',
      name: 'Failed script',
      inputCount: 7,
      outputCount: 0,
      status: 'error',
    });

    const graph = tracerToStepGraphConfig(tracer, 'transform-stage');
    expect(graph?.scriptNode).toMatchObject({
      title: 'Working script',
      decisionStats: { primaryCount: 7, secondaryCount: 3 },
    });
    expect(graph?.destinationBuckets.map((bucket) => bucket.count)).toEqual([7, 3]);

    tracer.updateStageMetrics('transform-stage', { passCount: 6, flagCount: 4 });
    expect(tracerToStepGraphConfig(tracer, 'transform-stage')?.destinationBuckets.map(
      (bucket) => bucket.count
    )).toEqual([6, 4]);
  });

  it('derives missing dropped counts and ignores error-only transform events', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'transform-stage', name: 'Transform', type: 'transform', itemCount: 5 });
    tracer.recordEvent({
      category: 'transform',
      stageId: 'transform-stage',
      name: 'Failed script',
      inputCount: 5,
      outputCount: 0,
      status: 'error',
    });
    expect(tracerToStepGraphConfig(tracer, 'transform-stage')?.scriptNode).toBeUndefined();

    tracer.recordEvent({
      category: 'transform',
      stageId: 'transform-stage',
      name: 'Working script',
      inputCount: 5,
      outputCount: 4,
      status: 'success',
    });
    expect(tracerToStepGraphConfig(tracer, 'transform-stage')?.destinationBuckets.map(
      (bucket) => bucket.count
    )).toEqual([4, 1]);
  });

  it('retains fallback slices and script label in the generated graph', () => {
    const tracer = new PipelineTracer();
    tracer.startStage({ id: 'fallback-stage', name: 'Fallback', type: 'jev' });
    const slices = { flagged_queue: { key: 'flagged_queue', title: 'Flagged', count: 0, items: [] } };

    expect(tracerToStepGraphConfig(tracer, 'fallback-stage', {
      slices,
      scriptLabel: 'classification.js',
    })).toMatchObject({ slices, scriptLabel: 'classification.js' });
  });
});
