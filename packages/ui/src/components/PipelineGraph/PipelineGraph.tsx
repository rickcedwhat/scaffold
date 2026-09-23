import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { StepGraph } from './StepGraph';
import { DatasetSliceDrawer } from './DatasetSliceDrawer';
import { ScriptInspectorDrawer } from './ScriptInspectorDrawer';
import type {
  PipelineStageConfig,
  StepGraphConfig,
  OutcomeSlice,
  ScriptRuleNodeConfig,
} from './types';

export interface PipelineGraphProps {
  stages: PipelineStageConfig[];
  activeStageId?: string;
  onSelectStage?: (stageId: string) => void;
  stepGraphConfig?: StepGraphConfig;
  slices?: Record<string, OutcomeSlice>;
  defaultZoomLevel?: 'macro' | 'micro';
}

export function PipelineGraph({
  stages,
  activeStageId,
  onSelectStage,
  stepGraphConfig,
  slices = {},
  defaultZoomLevel = 'macro',
}: PipelineGraphProps) {
  const { colors, tokens } = useTheme();
  const [zoomLevel, setZoomLevel] = useState<'macro' | 'micro'>(defaultZoomLevel);
  const [selectedSlice, setSelectedSlice] = useState<OutcomeSlice | null>(null);
  const [selectedScript, setSelectedScript] = useState<ScriptRuleNodeConfig | null>(null);

  const currentActiveStageId = activeStageId || stages[0]?.id;
  const currentIndex = stages.findIndex((s) => s.id === currentActiveStageId);
  const prevStage = currentIndex > 0 ? stages[currentIndex - 1] : undefined;
  const nextStage =
    currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : undefined;

  const handleSelectSlice = (sliceKey: string, title: string, count: number) => {
    const matchedSlice = stepGraphConfig?.slices?.[sliceKey] ?? slices[sliceKey];
    if (matchedSlice) {
      setSelectedSlice(matchedSlice);
    } else {
      setSelectedSlice({
        key: sliceKey,
        title,
        count,
        items: [],
      });
    }
  };

  const handleSelectScript = (script: ScriptRuleNodeConfig) => {
    setSelectedScript(script);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* MACRO VIEW: Pipeline Stage Sequence (Click card to zoom in) */}
      {zoomLevel === 'macro' && (
        <div
          style={{
            backgroundColor: colors.bg.canvas,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: tokens.radii.xl,
            padding: tokens.spacing[5],
            boxShadow: tokens.shadows.xl,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[4],
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${colors.border.subtle}`,
              paddingBottom: tokens.spacing[3],
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: tokens.typography.fontSize.base,
                  fontWeight: 700,
                  color: colors.text.primary,
                }}
              >
                Pipeline Stage Sequence
              </h3>
              <p
                style={{
                  margin: `${tokens.spacing[1]} 0 0 0`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: colors.text.secondary,
                }}
              >
                Click any stage card to zoom in and inspect its live node diagram.
              </p>
            </div>
            <span
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontFamily: tokens.typography.fontFamily.mono,
                color: colors.intent.primary.main,
              }}
            >
              {stages.length} Stages Configured
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {stages.map((stage) => {
              const isSelected = stage.id === currentActiveStageId;
              const isRunning = stage.status === 'running';
              const statusColor =
                stage.status === 'success'
                  ? colors.intent.success.hover
                  : stage.status === 'flagged' || stage.status === 'error'
                    ? colors.intent.danger.main
                    : isRunning
                      ? colors.intent.primary.main
                      : colors.intent.neutral.main;

              return (
                <div
                  key={stage.id}
                  onClick={() => {
                    if (onSelectStage) {
                      onSelectStage(stage.id);
                      setZoomLevel('micro');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (onSelectStage && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSelectStage(stage.id);
                      setZoomLevel('micro');
                    }
                  }}
                  style={{
                    backgroundColor: colors.bg.surface,
                    border: `2px solid ${isSelected ? colors.intent.primary.main : colors.border.subtle}`,
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing[4],
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '140px',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontFamily: tokens.typography.fontFamily.mono,
                          color: isRunning ? colors.intent.primary.main : colors.text.secondary,
                          fontWeight: 700,
                        }}
                      >
                        {stage.badge || stage.type.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontFamily: tokens.typography.fontFamily.mono,
                          color: statusColor,
                        }}
                      >
                        {stage.status.toUpperCase()}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: 700,
                        color: colors.text.primary,
                      }}
                    >
                      {stage.name}
                    </h4>

                    {stage.description && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: tokens.typography.fontSize.xs,
                          color: colors.text.secondary,
                          lineHeight: 1.4,
                        }}
                      >
                        {stage.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      borderTop: `1px solid ${colors.border.subtle}`,
                      paddingTop: tokens.spacing[2],
                      marginTop: tokens.spacing[2],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: tokens.typography.fontSize.xs,
                      fontFamily: tokens.typography.fontFamily.mono,
                    }}
                  >
                    <span style={{ color: colors.text.secondary }}>
                      {stage.itemCount !== undefined
                        ? `${stage.itemCount.toLocaleString()} items`
                        : ''}
                    </span>
                    <span style={{ color: colors.intent.primary.main, fontWeight: 600 }}>
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MICRO VIEW: The Live Step Node Graph Canvas */}
      {zoomLevel === 'micro' && stepGraphConfig && (
        <StepGraph
          config={stepGraphConfig}
          onSelectSlice={handleSelectSlice}
          onSelectScript={handleSelectScript}
          onBack={() => setZoomLevel('macro')}
          onPrev={onSelectStage && prevStage ? () => onSelectStage(prevStage.id) : undefined}
          onNext={onSelectStage && nextStage ? () => onSelectStage(nextStage.id) : undefined}
          prevLabel={prevStage?.name}
          nextLabel={nextStage?.name}
        />
      )}

      {zoomLevel === 'micro' && !stepGraphConfig && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: tokens.spacing[3],
            padding: tokens.spacing[6],
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: tokens.radii.xl,
            boxShadow: tokens.shadows.lg,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: colors.text.primary,
              fontSize: tokens.typography.fontSize.base,
            }}
          >
            Stage configuration unavailable
          </h3>
          <p
            style={{
              margin: 0,
              color: colors.text.secondary,
              fontSize: tokens.typography.fontSize.sm,
            }}
          >
            This stage does not have a detailed step graph to inspect.
          </p>
          <button
            type="button"
            onClick={() => setZoomLevel('macro')}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
              color: colors.intent.primary.text,
              backgroundColor: colors.intent.primary.main,
              border: `1px solid ${colors.intent.primary.main}`,
              borderRadius: tokens.radii.md,
              fontSize: tokens.typography.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            &larr; All Stages
          </button>
        </div>
      )}

      {/* Deep-Dive Inspection Drawers */}
      <DatasetSliceDrawer
        slice={selectedSlice}
        isOpen={selectedSlice !== null}
        onClose={() => setSelectedSlice(null)}
      />

      <ScriptInspectorDrawer
        script={selectedScript}
        isOpen={selectedScript !== null}
        onClose={() => setSelectedScript(null)}
      />
    </div>
  );
}
