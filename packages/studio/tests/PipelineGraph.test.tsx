import { describe, it, expect } from 'vitest';
import { render as tlRender, screen, fireEvent } from '@testing-library/react';
import React, { type ReactElement } from 'react';
import { ThemeProvider } from '@scaffold/ui';
import {
  PipelineGraph,
  StepGraph,
  DatasetSliceDrawer,
  ScriptInspectorDrawer,
  type PipelineStageConfig,
  type StepGraphConfig,
  type OutcomeSlice,
  type ScriptRuleNodeConfig,
} from '../src';

function render(ui: ReactElement) {
  return tlRender(<ThemeProvider>{ui}</ThemeProvider>);
}

const mockStages: PipelineStageConfig[] = [
  {
    id: 'stage-1',
    name: 'Wordlist Ingest',
    type: 'transform',
    status: 'success',
    itemCount: 2500,
  },
  {
    id: 'stage-2',
    name: 'Jev Lexical Filter',
    type: 'jev',
    status: 'running',
    itemCount: 2410,
  },
  {
    id: 'stage-3',
    name: 'Gemini Lexicography',
    type: 'llm',
    status: 'queued',
    itemCount: 2410,
  },
];

const mockScriptNode: ScriptRuleNodeConfig = {
  id: 'script-1',
  type: 'script',
  title: 'decideShouldRemove()',
  filePath: 'scripts/applyValidityPrune.ts',
  consumedInputs: ['jev.verdict', 'jev.confidence'],
  codeSnippet: 'if (conf >= 0.70 && verdict !== "valid") prune();',
  fullCode: 'export function decideShouldRemove(...) { ... }',
  decisionStats: {
    primaryLabel: 'pruned',
    primaryCount: 90,
    secondaryLabel: 'kept',
    secondaryCount: 2410,
  },
};

const mockStepConfig: StepGraphConfig = {
  stageId: 'stage-2',
  stageName: 'Lexical Prune & Filtering',
  stageType: 'jev',
  scriptLabel: 'applyValidityPrune.ts',
  source: {
    label: 'Candidate Words',
    count: 2500,
    description: 'Raw tokens from frequency list',
  },
  questionNodes: [
    {
      id: 'q1',
      type: 'choice',
      title: 'Q1: Lexical Validity',
      subtitle: 'Screens names and foreign words',
      options: [
        { key: 'valid', label: 'valid', percentage: 96, count: 2410 },
        { key: 'proper_noun', label: 'proper_noun', percentage: 3, count: 70, isFlag: true },
        { key: 'foreign_leak', label: 'foreign_leak', percentage: 1, count: 20, isFlag: true },
      ],
    },
    {
      id: 'q2',
      type: 'score',
      title: 'Q2: Difficulty Score',
      metricLabel: 'difficulty',
      cutoffValue: 0.90,
      tiers: [
        { key: 'elementary', label: 'Elem', percentage: 30, count: 750 },
        { key: 'intermediate', label: 'Inter', percentage: 50, count: 1250 },
        { key: 'advanced', label: 'Adv', percentage: 15, count: 375 },
        { key: 'obscure', label: 'Obscure', percentage: 5, count: 125, isFlag: true },
      ],
    },
  ],
  scriptNode: mockScriptNode,
  destinationBuckets: [
    {
      id: 'clean_pass',
      title: 'Clean Seed List',
      count: 2410,
      percentage: 96.4,
      intent: 'success',
    },
    {
      id: 'pruned',
      title: 'Pruned Trash',
      count: 90,
      percentage: 3.6,
      intent: 'error',
      isFlag: true,
    },
  ],
};

const mockSlices: Record<string, OutcomeSlice> = {
  proper_noun: {
    key: 'proper_noun',
    title: 'Proper Noun Leaks',
    count: 2,
    items: [
      {
        id: '1',
        title: 'johns',
        subtitle: 'fr • noun',
        verdict: 'proper_noun',
        confidence: 94,
        contentPreview: 'Character name in captions',
        rationale: 'Subtitle proper noun leak',
        isFlag: true,
      },
      {
        id: '2',
        title: 'smith',
        subtitle: 'fr • noun',
        verdict: 'proper_noun',
        confidence: 98,
        contentPreview: 'English surname',
        rationale: 'English character name',
        isFlag: true,
      },
    ],
  },
};

describe('PipelineGraph & StepGraph', () => {
  it('renders macro pipeline stages and switches zoom levels', () => {
    render(
      <PipelineGraph
        stages={mockStages}
        defaultZoomLevel="macro"
        stepGraphConfig={mockStepConfig}
        onSelectStage={() => {}}
      />
    );

    expect(screen.getAllByText('Wordlist Ingest').length).toBeGreaterThan(0);
    expect(screen.getByText('Jev Lexical Filter')).toBeInTheDocument();
    expect(screen.getByText('Gemini Lexicography')).toBeInTheDocument();

    // Click on stage card to zoom into detailed view
    const stageCard = screen.getByText('Jev Lexical Filter');
    fireEvent.click(stageCard);

    expect(screen.getByText('STAGE ARCHITECTURE')).toBeInTheDocument();
    expect(screen.getByText('Q1: Lexical Validity')).toBeInTheDocument();

    // Zoom back out to macro view
    const backBtn = screen.getByRole('button', { name: /all stages/i });
    fireEvent.click(backBtn);

    expect(screen.getByText('Pipeline Stage Sequence')).toBeInTheDocument();
  });

  it('keeps macro view and hides stage navigation without onSelectStage', () => {
    render(
      <PipelineGraph
        stages={mockStages}
        activeStageId="stage-2"
        defaultZoomLevel="macro"
        stepGraphConfig={mockStepConfig}
      />
    );

    fireEvent.click(screen.getByText('Jev Lexical Filter'));
    fireEvent.keyDown(screen.getByText('Jev Lexical Filter'), { key: 'Enter' });

    expect(screen.getByText('Pipeline Stage Sequence')).toBeInTheDocument();
    expect(screen.queryByText('STAGE ARCHITECTURE')).not.toBeInTheDocument();
  });

  it('renders StepGraph with choice, score, script, and bucket nodes', () => {
    render(<StepGraph config={mockStepConfig} />);

    expect(screen.getByText('Candidate Words')).toBeInTheDocument();
    expect(screen.getByText('2,500')).toBeInTheDocument();
    expect(screen.getByText('Q1: Lexical Validity')).toBeInTheDocument();
    expect(screen.getByText('Q2: Difficulty Score')).toBeInTheDocument();
    expect(screen.getByText('decideShouldRemove()')).toBeInTheDocument();
    expect(screen.getByText('Clean Seed List')).toBeInTheDocument();
    expect(screen.getByText('Pruned Trash')).toBeInTheDocument();
  });

  it('invokes onSelectSlice when an outcome strip is clicked', () => {
    let selectedKey = '';
    render(
      <StepGraph
        config={mockStepConfig}
        onSelectSlice={(key) => {
          selectedKey = key;
        }}
      />
    );

    const strip = screen.getByText(/proper_noun/i);
    fireEvent.click(strip);
    expect(selectedKey).toBe('proper_noun');
  });

  it('opens DatasetSliceDrawer and filters by search query', () => {
    const handleClose = () => {};
    render(
      <DatasetSliceDrawer
        slice={mockSlices.proper_noun}
        isOpen={true}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Proper Noun Leaks')).toBeInTheDocument();
    expect(screen.getByText('johns')).toBeInTheDocument();
    expect(screen.getByText('smith')).toBeInTheDocument();

    // Search filter
    const searchInput = screen.getByPlaceholderText(/search items/i);
    fireEvent.change(searchInput, { target: { value: 'johns' } });

    expect(screen.getByText('johns')).toBeInTheDocument();
    expect(screen.queryByText('smith')).not.toBeInTheDocument();
  });

  it('renders ScriptInspectorDrawer with consumed inputs and code', () => {
    render(
      <ScriptInspectorDrawer
        script={mockScriptNode}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('decideShouldRemove()')).toBeInTheDocument();
    expect(screen.getByText('scripts/applyValidityPrune.ts')).toBeInTheDocument();
    expect(screen.getByText(/jev\.verdict/i)).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('pruned')).toBeInTheDocument();
  });

  it('navigates to next and previous steps from the detailed view', () => {
    let currentStage = 'stage-2';
    const { rerender } = render(
      <PipelineGraph
        stages={mockStages}
        activeStageId={currentStage}
        defaultZoomLevel="micro"
        stepGraphConfig={mockStepConfig}
        onSelectStage={(id) => {
          currentStage = id;
        }}
      />
    );

    // Should see Next and Prev buttons
    const nextBtn = screen.getByRole('button', { name: /next/i });
    const prevBtn = screen.getByRole('button', { name: /prev/i });

    expect(nextBtn).toBeEnabled();
    expect(prevBtn).toBeEnabled();

    // Click next step
    fireEvent.click(nextBtn);
    expect(currentStage).toBe('stage-3');

    // Rerender with stage-3
    rerender(
      <PipelineGraph
        stages={mockStages}
        activeStageId="stage-3"
        defaultZoomLevel="micro"
        stepGraphConfig={{
          ...mockStepConfig,
          stageId: 'stage-3',
          stageName: 'Gemini Lexicography',
        }}
        onSelectStage={(id) => {
          currentStage = id;
        }}
      />
    );

    // Now click prev step
    const prevBtnOn3 = screen.getByRole('button', { name: /prev/i });
    fireEvent.click(prevBtnOn3);
    expect(currentStage).toBe('stage-2');
  });

  it('does not expose adjacent-stage navigation without onSelectStage', () => {
    render(
      <PipelineGraph
        stages={mockStages}
        activeStageId="stage-2"
        defaultZoomLevel="micro"
        stepGraphConfig={mockStepConfig}
      />
    );

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('triggers onSelectScript when clicking the Script Rule node', () => {
    let clickedScript: ScriptRuleNodeConfig | null = null;
    render(
      <StepGraph
        config={mockStepConfig}
        onSelectScript={(script) => {
          clickedScript = script;
        }}
      />
    );

    const scriptNode = screen.getByText('decideShouldRemove()');
    fireEvent.click(scriptNode);
    expect(clickedScript).not.toBeNull();
    expect((clickedScript as unknown as ScriptRuleNodeConfig)?.id).toBe('script-1');
  });

  it('discloses hover popovers on diagram nodes', () => {
    render(<StepGraph config={mockStepConfig} />);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    const scriptNode = screen.getByText('decideShouldRemove()');
    fireEvent.mouseEnter(scriptNode);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeVisible();
    expect(tooltip).toHaveTextContent('scripts/applyValidityPrune.ts');

    fireEvent.mouseLeave(scriptNode);
  });

  it('allows clicking items within the popover while mouse transitions across hover bridge', () => {
    let selectedKey = '';
    render(
      <StepGraph
        config={mockStepConfig}
        onSelectSlice={(key) => {
          selectedKey = key;
        }}
      />
    );

    const questionTitle = screen.getByText('Q1: Lexical Validity');
    fireEvent.mouseEnter(questionTitle);

    const properNounItem = screen.getByText(/proper_noun/i);
    fireEvent.click(properNounItem);

    expect(selectedKey).toBe('proper_noun');
  });

  it('uses the active step configuration slice before the global fallback', () => {
    const localSlice = {
      ...mockSlices.proper_noun,
      title: 'Stage-specific proper nouns',
    };

    render(
      <PipelineGraph
        stages={mockStages}
        defaultZoomLevel="micro"
        stepGraphConfig={{
          ...mockStepConfig,
          slices: { proper_noun: localSlice },
        }}
        slices={mockSlices}
      />
    );

    fireEvent.mouseEnter(screen.getByText('Q1: Lexical Validity'));
    fireEvent.click(screen.getByText(/proper_noun/i));

    expect(screen.getByRole('dialog', { name: 'Stage-specific proper nouns' })).toBeVisible();
  });

  it('provides a way back when micro zoom has no step configuration', () => {
    render(<PipelineGraph stages={mockStages} defaultZoomLevel="micro" />);

    expect(screen.getByText('Stage configuration unavailable')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /all stages/i }));
    expect(screen.getByText('Pipeline Stage Sequence')).toBeInTheDocument();
  });

  it('wraps the architecture grid when wrap is enabled', () => {
    render(<StepGraph config={mockStepConfig} wrap />);

    const sourceNode = screen.getByText('Candidate Words').closest('[role="button"]');
    const graphGrid = sourceNode?.parentElement?.parentElement;
    expect(graphGrid).toHaveStyle({
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    });
  });

  it('resets filtering for a different slice but preserves it when reopening the same slice', () => {
    const { rerender } = render(
      <DatasetSliceDrawer
        slice={mockSlices.proper_noun}
        isOpen={true}
        onClose={() => {}}
        pageSize={1}
      />
    );
    const search = screen.getByRole('textbox', { name: 'Search sample items' });
    fireEvent.change(search, { target: { value: 's' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <DatasetSliceDrawer
          slice={mockSlices.proper_noun}
          isOpen={false}
          onClose={() => {}}
          pageSize={1}
        />
      </ThemeProvider>
    );
    rerender(
      <ThemeProvider>
        <DatasetSliceDrawer
          slice={mockSlices.proper_noun}
          isOpen={true}
          onClose={() => {}}
          pageSize={1}
        />
      </ThemeProvider>
    );
    expect(screen.getByRole('textbox', { name: 'Search sample items' })).toHaveValue('s');
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <DatasetSliceDrawer
          slice={{ ...mockSlices.proper_noun, key: 'other', title: 'Other slice' }}
          isOpen={true}
          onClose={() => {}}
          pageSize={1}
        />
      </ThemeProvider>
    );
    expect(screen.getByRole('textbox', { name: 'Search sample items' })).toHaveValue('');
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('names drawer controls and distinguishes empty samples from no matches', () => {
    const { rerender } = render(
      <DatasetSliceDrawer
        slice={{ key: 'empty', title: 'Empty slice', count: 0, items: [] }}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByRole('textbox', { name: 'Search sample items' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Sort sample items' })).toBeInTheDocument();
    expect(screen.getByText('No sample items available')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <DatasetSliceDrawer
          slice={mockSlices.proper_noun}
          isOpen={true}
          onClose={() => {}}
          pageSize={1}
        />
      </ThemeProvider>
    );
    expect(screen.getByText('Showing 1–1 of 2')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search sample items' }), {
      target: { value: 'missing' },
    });
    expect(screen.getByText('No items match the current search filter.')).toBeInTheDocument();
  });

  it('closes modal drawers with Escape', () => {
    let closed = false;
    render(
      <ScriptInspectorDrawer
        script={mockScriptNode}
        isOpen={true}
        onClose={() => {
          closed = true;
        }}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closed).toBe(true);
  });
});
