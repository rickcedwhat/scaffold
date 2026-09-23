import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import type {
  StepGraphConfig,
  ChoiceNodeConfig,
  ScoreNodeConfig,
  ScriptRuleNodeConfig,
} from './types';

export interface StepGraphProps {
  config: StepGraphConfig;
  onSelectSlice?: (sliceKey: string, title: string, count: number) => void;
  onSelectScript?: (script: ScriptRuleNodeConfig) => void;
  wrap?: boolean;
}

export function StepGraph({
  config,
  onSelectSlice,
  onSelectScript,
  wrap = true,
}: StepGraphProps) {
  const { colors, tokens } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[4],
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Step Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: colors.intent.primary.main,
                textTransform: 'uppercase',
              }}
            >
              STAGE ARCHITECTURE
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                fontWeight: 700,
                padding: `1px ${tokens.spacing[1]}`,
                borderRadius: tokens.radii.sm,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: colors.intent.primary.main,
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              {config.stageType.toUpperCase()}
            </span>
          </div>
          <h2
            style={{
              margin: `${tokens.spacing[1]} 0 0 0`,
              fontSize: '16px',
              fontWeight: 700,
              color: colors.text.primary,
            }}
          >
            {config.stageName}
          </h2>
        </div>

        {config.scriptLabel && (
          <div
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: colors.text.muted,
              backgroundColor: colors.bg.subtle,
              padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
              borderRadius: tokens.radii.md,
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            Script: <strong style={{ color: colors.intent.primary.main }}>{config.scriptLabel}</strong>
          </div>
        )}
      </div>

      {/* Graph Node Canvas (Flow layout with wrapping support) */}
      <div
        style={{
          display: 'flex',
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap: tokens.spacing[5],
          alignItems: 'stretch',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* 1. Source Inputs Node */}
        <div
          style={{
            flex: '1 1 240px',
            minWidth: '220px',
            backgroundColor: colors.bg.surface,
            border: `2px solid ${colors.intent.primary.main}`,
            borderRadius: tokens.radii.xl,
            padding: tokens.spacing[4],
            boxShadow: tokens.shadows.md,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${colors.border.subtle}`,
                paddingBottom: tokens.spacing[1],
                marginBottom: tokens.spacing[2],
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: colors.intent.primary.main,
                  textTransform: 'uppercase',
                }}
              >
                {config.source.label}
              </span>
              {config.source.sublabel && (
                <span style={{ fontSize: '10px', color: colors.text.muted, fontFamily: 'monospace' }}>
                  {config.source.sublabel}
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: colors.text.primary,
              }}
            >
              {config.source.count.toLocaleString()}
            </div>
            {config.source.description && (
              <p
                style={{
                  margin: `${tokens.spacing[1]} 0 0 0`,
                  fontSize: '11px',
                  color: colors.text.muted,
                  fontFamily: 'monospace',
                }}
              >
                {config.source.description}
              </p>
            )}
          </div>

          {onSelectSlice && (
            <button
              type="button"
              onClick={() => onSelectSlice('all', config.source.label, config.source.count)}
              style={{
                marginTop: tokens.spacing[3],
                fontSize: '11px',
                fontFamily: 'monospace',
                color: colors.intent.primary.main,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                textDecoration: 'underline',
              }}
            >
              Browse All Inputs &rarr;
            </button>
          )}
        </div>

        {/* 2. Question / Operation Nodes (Choice / Score) */}
        <div
          style={{
            flex: '2 1 340px',
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[3],
            boxSizing: 'border-box',
          }}
        >
          {config.questionNodes.map((node) => (
            <div
              key={node.id}
              style={{
                backgroundColor: colors.bg.surface,
                border: `2px solid ${node.type === 'score' ? colors.intent.secondary.main : colors.intent.primary.main}`,
                borderRadius: tokens.radii.xl,
                padding: tokens.spacing[4],
                boxShadow: tokens.shadows.md,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[1],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <span
                    style={{
                      fontSize: '9px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: `1px ${tokens.spacing[1]}`,
                      borderRadius: tokens.radii.sm,
                      backgroundColor:
                        node.type === 'score'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : colors.intent.primary.subtle,
                      color:
                        node.type === 'score'
                          ? colors.intent.secondary.main
                          : colors.intent.primary.main,
                    }}
                  >
                    {node.type.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: colors.text.primary,
                    }}
                  >
                    {node.title}
                  </span>
                </div>

                {node.type === 'choice' && (node as ChoiceNodeConfig).throughput && (
                  <span style={{ fontSize: '10px', color: colors.text.muted, fontFamily: 'monospace' }}>
                    {(node as ChoiceNodeConfig).throughput}
                  </span>
                )}
                {node.type === 'score' && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: colors.intent.secondary.main,
                    }}
                  >
                    cutoff: {(node as ScoreNodeConfig).cutoffValue}
                  </span>
                )}
              </div>

              {node.subtitle && (
                <p
                  style={{
                    margin: `0 0 ${tokens.spacing[2]} 0`,
                    fontSize: '11px',
                    color: colors.text.muted,
                    fontFamily: 'monospace',
                  }}
                >
                  {node.subtitle}
                </p>
              )}

              {/* Choice Node Strips */}
              {node.type === 'choice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {(node as ChoiceNodeConfig).options.map((opt) => (
                    <div
                      key={opt.key}
                      onClick={() =>
                        onSelectSlice?.(opt.key, `${node.title} &bull; ${opt.label}`, opt.count)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onSelectSlice?.(opt.key, `${node.title} &bull; ${opt.label}`, opt.count);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        borderRadius: tokens.radii.md,
                        backgroundColor: colors.bg.canvas,
                        border: `1px solid ${opt.isFlag ? colors.intent.danger.main : colors.border.subtle}`,
                        cursor: onSelectSlice ? 'pointer' : 'default',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          color: opt.isFlag ? colors.intent.danger.main : colors.intent.success.main,
                          fontWeight: opt.isFlag ? 700 : 500,
                        }}
                      >
                        {opt.label}
                      </span>
                      <span
                        style={{
                          color: opt.isFlag ? colors.intent.danger.main : colors.text.primary,
                          fontWeight: 700,
                        }}
                      >
                        {opt.percentage}% ({opt.count.toLocaleString()}) &rarr;
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Score Node Tiers */}
              {node.type === 'score' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${(node as ScoreNodeConfig).tiers.length}, 1fr)`,
                    gap: tokens.spacing[1],
                    textAlign: 'center',
                  }}
                >
                  {(node as ScoreNodeConfig).tiers.map((tier) => (
                    <div
                      key={tier.key}
                      onClick={() =>
                        onSelectSlice?.(tier.key, `${node.title} &bull; ${tier.label}`, tier.count)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onSelectSlice?.(tier.key, `${node.title} &bull; ${tier.label}`, tier.count);
                        }
                      }}
                      style={{
                        backgroundColor: colors.bg.canvas,
                        padding: tokens.spacing[1],
                        borderRadius: tokens.radii.md,
                        border: `1px solid ${tier.isFlag ? colors.intent.danger.main : colors.border.subtle}`,
                        cursor: onSelectSlice ? 'pointer' : 'default',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    >
                      <span style={{ color: colors.text.muted, display: 'block', fontSize: '10px' }}>
                        {tier.label}
                      </span>
                      <strong
                        style={{
                          color: tier.isFlag ? colors.intent.danger.main : colors.intent.success.main,
                          display: 'block',
                          marginTop: '2px',
                        }}
                      >
                        {tier.percentage}%
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 3. Script / Rule Node (First-Class Citizen) */}
        {config.scriptNode && (
          <div
            style={{
              flex: '1.5 1 280px',
              minWidth: '260px',
              backgroundColor: colors.bg.surface,
              border: `2px solid ${colors.intent.primary.main}`,
              borderRadius: tokens.radii.xl,
              padding: tokens.spacing[4],
              boxShadow: tokens.shadows.md,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  paddingBottom: tokens.spacing[1],
                  marginBottom: tokens.spacing[2],
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <span
                    style={{
                      fontSize: '9px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: `1px ${tokens.spacing[1]}`,
                      borderRadius: tokens.radii.sm,
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: colors.intent.primary.main,
                    }}
                  >
                    &lt;/&gt; SCRIPT RULE
                  </span>
                </div>

                {onSelectScript && (
                  <button
                    type="button"
                    onClick={() => onSelectScript(config.scriptNode!)}
                    style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      color: colors.intent.primary.main,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    View Code
                  </button>
                )}
              </div>

              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: colors.text.primary,
                }}
              >
                {config.scriptNode.title}
              </div>
              {config.scriptNode.subtitle && (
                <div
                  style={{
                    fontSize: '11px',
                    color: colors.text.muted,
                    marginTop: '2px',
                    fontFamily: 'monospace',
                  }}
                >
                  {config.scriptNode.subtitle}
                </div>
              )}

              {/* Code Snippet Box */}
              <pre
                style={{
                  marginTop: tokens.spacing[2],
                  marginBottom: tokens.spacing[2],
                  padding: tokens.spacing[2],
                  backgroundColor: colors.bg.canvas,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: tokens.radii.md,
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  lineHeight: 1.45,
                  color: colors.text.primary,
                  overflowX: 'auto',
                }}
              >
                {config.scriptNode.codeSnippet}
              </pre>
            </div>

            {config.scriptNode.decisionStats && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: `1px solid ${colors.border.subtle}`,
                  paddingTop: tokens.spacing[2],
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                <span style={{ color: colors.intent.danger.main, fontWeight: 700 }}>
                  {config.scriptNode.decisionStats.primaryCount} {config.scriptNode.decisionStats.primaryLabel}
                </span>
                <span style={{ color: colors.intent.success.main, fontWeight: 700 }}>
                  {config.scriptNode.decisionStats.secondaryCount} {config.scriptNode.decisionStats.secondaryLabel}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 4. Destination Buckets Node */}
        <div
          style={{
            flex: '1 1 220px',
            minWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[3],
            boxSizing: 'border-box',
          }}
        >
          {config.destinationBuckets.map((bucket) => {
            const isError = bucket.intent === 'error' || bucket.isFlag;
            const borderColor = isError ? colors.intent.danger.main : colors.intent.success.main;
            const barColor = isError ? colors.intent.danger.main : colors.intent.success.main;

            return (
              <div
                key={bucket.id}
                onClick={() => onSelectSlice?.(bucket.id, bucket.title, bucket.count)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectSlice?.(bucket.id, bucket.title, bucket.count);
                  }
                }}
                style={{
                  backgroundColor: colors.bg.surface,
                  border: `2px solid ${borderColor}`,
                  borderRadius: tokens.radii.xl,
                  padding: tokens.spacing[4],
                  boxShadow: tokens.shadows.md,
                  cursor: onSelectSlice ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[1],
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: borderColor,
                      textTransform: 'uppercase',
                    }}
                  >
                    {bucket.title}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: borderColor,
                    }}
                  >
                    {bucket.percentage}%
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: colors.text.primary,
                  }}
                >
                  {bucket.count.toLocaleString()}
                </div>

                {/* Percentage Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: tokens.radii.full,
                    backgroundColor: colors.bg.canvas,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${bucket.percentage}%`,
                      backgroundColor: barColor,
                      borderRadius: tokens.radii.full,
                    }}
                  />
                </div>

                {bucket.description && (
                  <div style={{ fontSize: '10px', color: colors.text.muted, fontFamily: 'monospace' }}>
                    {bucket.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
