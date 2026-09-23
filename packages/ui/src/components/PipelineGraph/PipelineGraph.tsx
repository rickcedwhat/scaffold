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
  defaultZoomLevel = 'micro',
}: PipelineGraphProps) {
  const { colors, tokens } = useTheme();
  const [zoomLevel, setZoomLevel] = useState<'macro' | 'micro'>(defaultZoomLevel);
  const [selectedSlice, setSelectedSlice] = useState<OutcomeSlice | null>(null);
  const [selectedScript, setSelectedScript] = useState<ScriptRuleNodeConfig | null>(null);

  const selectedStage = stages.find((s) => s.id === activeStageId) || stages[0];

  const handleSelectSlice = (sliceKey: string, title: string, count: number) => {
    if (slices[sliceKey]) {
      setSelectedSlice(slices[sliceKey]);
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
        gap: tokens.spacing[5],
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Navigation & Zoom Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: tokens.spacing[3],
          backgroundColor: colors.bg.surface,
          border: `1px solid ${colors.border.subtle}`,
          borderRadius: tokens.radii.xl,
          padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: `2px ${tokens.spacing[2]}`,
              borderRadius: tokens.radii.sm,
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: colors.intent.primary.main,
            }}
          >
            PIPELINE GRAPH
          </span>

          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: colors.text.primary,
            }}
          >
            {selectedStage?.name || 'Pipeline Studio'}
          </span>
        </div>

        {/* Zoom Level Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: colors.bg.canvas,
            border: `1px solid ${colors.border.default}`,
            borderRadius: tokens.radii.lg,
            padding: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setZoomLevel('macro')}
            style={{
              fontSize: '12px',
              fontFamily: 'sans-serif',
              fontWeight: zoomLevel === 'macro' ? 700 : 500,
              padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
              borderRadius: tokens.radii.md,
              backgroundColor: zoomLevel === 'macro' ? colors.bg.surface : 'transparent',
              color: zoomLevel === 'macro' ? colors.intent.primary.main : colors.text.muted,
              border: zoomLevel === 'macro' ? `1px solid ${colors.border.subtle}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Macro Pipeline
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel('micro')}
            style={{
              fontSize: '12px',
              fontFamily: 'sans-serif',
              fontWeight: zoomLevel === 'micro' ? 700 : 500,
              padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
              borderRadius: tokens.radii.md,
              backgroundColor: zoomLevel === 'micro' ? colors.bg.surface : 'transparent',
              color: zoomLevel === 'micro' ? colors.intent.primary.main : colors.text.muted,
              border: zoomLevel === 'micro' ? `1px solid ${colors.border.subtle}` : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Detailed Step Graph
          </button>
        </div>
      </div>

      {/* MACRO VIEW: Connected High-Level Pipeline Stages */}
      {zoomLevel === 'macro' && (
        <div
          style={{
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: tokens.radii.xl,
            padding: tokens.spacing[5],
            boxShadow: tokens.shadows.md,
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
                  fontSize: '16px',
                  fontWeight: 700,
                  color: colors.text.primary,
                }}
              >
                Connected Pipeline Stages
              </h3>
              <p
                style={{
                  margin: `${tokens.spacing[1]} 0 0 0`,
                  fontSize: '12px',
                  color: colors.text.muted,
                }}
              >
                Click any stage card to zoom in and inspect its internal operation nodes.
              </p>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: colors.intent.primary.main,
              }}
            >
              {stages.length} Stages Total
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            {stages.map((stage, idx) => {
              const isSelected = stage.id === (activeStageId || stages[0].id);
              const isRunning = stage.status === 'running';

              return (
                <div
                  key={stage.id}
                  onClick={() => {
                    onSelectStage?.(stage.id);
                    setZoomLevel('micro');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectStage?.(stage.id);
                      setZoomLevel('micro');
                    }
                  }}
                  style={{
                    backgroundColor: colors.bg.canvas,
                    border: `2px solid ${isSelected ? colors.intent.primary.main : colors.border.subtle}`,
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing[4],
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '140px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
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
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: isRunning ? colors.intent.primary.main : colors.text.muted,
                          fontWeight: 700,
                        }}
                      >
                        {isRunning ? '● ACTIVE' : `STAGE ${String(idx + 1).padStart(2, '0')}`}
                      </span>

                      <span
                        style={{
                          fontSize: '9px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          padding: `1px ${tokens.spacing[1]}`,
                          borderRadius: tokens.radii.sm,
                          backgroundColor:
                            stage.type === 'jev'
                              ? 'rgba(6, 182, 212, 0.15)'
                              : stage.type === 'llm'
                              ? 'rgba(168, 85, 247, 0.15)'
                              : 'rgba(148, 163, 184, 0.15)',
                          color:
                            stage.type === 'jev'
                              ? colors.intent.primary.main
                              : stage.type === 'llm'
                              ? '#a855f7'
                              : colors.text.muted,
                        }}
                      >
                        {stage.type.toUpperCase()}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: colors.text.primary,
                      }}
                    >
                      {stage.name}
                    </div>
                    {stage.description && (
                      <p
                        style={{
                          margin: `${tokens.spacing[1]} 0 0 0`,
                          fontSize: '11px',
                          color: colors.text.muted,
                          lineHeight: 1.35,
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
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ color: colors.text.muted }}>
                      {stage.itemCount.toLocaleString()} items
                    </span>
                    <span style={{ color: colors.intent.primary.main, fontWeight: 700 }}>
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MICRO VIEW: Detailed Step Node Graph */}
      {zoomLevel === 'micro' && stepGraphConfig && (
        <div
          style={{
            backgroundColor: colors.bg.surface,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: tokens.radii.xl,
            padding: tokens.spacing[5],
            boxShadow: tokens.shadows.md,
          }}
        >
          <StepGraph
            config={stepGraphConfig}
            onSelectSlice={handleSelectSlice}
            onSelectScript={handleSelectScript}
          />
        </div>
      )}

      {/* Dataset Drawer */}
      <DatasetSliceDrawer
        slice={selectedSlice}
        isOpen={Boolean(selectedSlice)}
        onClose={() => setSelectedSlice(null)}
      />

      {/* Script Drawer */}
      <ScriptInspectorDrawer
        script={selectedScript}
        isOpen={Boolean(selectedScript)}
        onClose={() => setSelectedScript(null)}
      />
    </div>
  );
}
