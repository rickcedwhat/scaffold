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
  const { tokens } = useTheme();
  const [zoomLevel, setZoomLevel] = useState<'macro' | 'micro'>(defaultZoomLevel);
  const [selectedSlice, setSelectedSlice] = useState<OutcomeSlice | null>(null);
  const [selectedScript, setSelectedScript] = useState<ScriptRuleNodeConfig | null>(null);

  const currentActiveStageId = activeStageId || stages[0]?.id;
  const currentIndex = stages.findIndex((s) => s.id === currentActiveStageId);
  const prevStage = currentIndex > 0 ? stages[currentIndex - 1] : undefined;
  const nextStage =
    currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : undefined;

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
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* MACRO VIEW: Pipeline Stage Sequence (Click card to zoom in) */}
      {zoomLevel === 'macro' && (
        <div
          style={{
            backgroundColor: '#030712',
            border: '1px solid #1e293b',
            borderRadius: tokens.radii.xl,
            padding: tokens.spacing[5],
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
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
              borderBottom: '1px solid #1e293b',
              paddingBottom: tokens.spacing[3],
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                Pipeline Stage Sequence
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Click any stage card to zoom in and inspect its live node diagram.
              </p>
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#818cf8' }}>
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
                    backgroundColor: '#0b0f19',
                    border: `2px solid ${isSelected ? '#6366f1' : '#1e293b'}`,
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
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: isRunning ? '#22d3ee' : '#94a3b8',
                          fontWeight: 700,
                        }}
                      >
                        {stage.badge || stage.type.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color:
                            stage.status === 'success'
                              ? '#34d399'
                              : isRunning
                                ? '#22d3ee'
                                : '#64748b',
                        }}
                      >
                        {stage.status.toUpperCase()}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#f8fafc',
                      }}
                    >
                      {stage.name}
                    </h4>

                    {stage.description && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: '11px',
                          color: '#94a3b8',
                          lineHeight: 1.4,
                        }}
                      >
                        {stage.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid #1e293b',
                      paddingTop: tokens.spacing[2],
                      marginTop: tokens.spacing[2],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ color: '#64748b' }}>
                      {stage.itemCount !== undefined
                        ? `${stage.itemCount.toLocaleString()} items`
                        : ''}
                    </span>
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>Inspect &rarr;</span>
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
          onPrev={prevStage ? () => onSelectStage?.(prevStage.id) : undefined}
          onNext={nextStage ? () => onSelectStage?.(nextStage.id) : undefined}
          prevLabel={prevStage?.name}
          nextLabel={nextStage?.name}
        />
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
