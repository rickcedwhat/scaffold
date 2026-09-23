import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import type {
  StepGraphConfig,
  ChoiceNodeConfig,
  ScriptRuleNodeConfig,
} from './types';

export interface StepGraphProps {
  config: StepGraphConfig;
  onSelectSlice?: (sliceKey: string, title: string, count: number) => void;
  onSelectScript?: (script: ScriptRuleNodeConfig) => void;
  wrap?: boolean;
}

interface CablePath {
  id: string;
  d: string;
  color: string;
  width: number;
}

export function StepGraph({
  config,
  onSelectSlice,
  onSelectScript,
}: StepGraphProps) {
  const { tokens } = useTheme();

  const canvasRef = useRef<HTMLDivElement>(null);
  const srcPortRef = useRef<HTMLDivElement>(null);
  const qInPortRefs = useRef<(HTMLDivElement | null)[]>([]);
  const qOutPortRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scriptInPortRef = useRef<HTMLDivElement>(null);
  const scriptOut1Ref = useRef<HTMLDivElement>(null);
  const scriptOut2Ref = useRef<HTMLDivElement>(null);
  const bucketInPortRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [cables, setCables] = useState<CablePath[]>([]);

  const calculateCables = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();

    const getPortCoord = (el: HTMLElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      // If element is not rendered or has 0 dimensions in JSDOM, provide fallback
      if (r.width === 0 && r.height === 0 && r.left === 0 && r.top === 0) {
        return null;
      }
      return {
        x: r.left + r.width / 2 - canvasRect.left,
        y: r.top + r.height / 2 - canvasRect.top,
      };
    };

    const newCables: CablePath[] = [];
    const srcOut = getPortCoord(srcPortRef.current);

    // 1. Source -> Questions
    if (srcOut) {
      qInPortRefs.current.forEach((qInEl, idx) => {
        const qIn = getPortCoord(qInEl);
        if (qIn) {
          const dx = Math.abs(qIn.x - srcOut.x) * 0.55;
          newCables.push({
            id: `src-q-${idx}`,
            d: `M ${srcOut.x} ${srcOut.y} C ${srcOut.x + dx} ${srcOut.y}, ${qIn.x - dx} ${qIn.y}, ${qIn.x} ${qIn.y}`,
            color: '#06b6d4',
            width: 2.5,
          });
        }
      });
    }

    // 2. Questions -> Script (or Questions -> Buckets if no script)
    const scriptIn = getPortCoord(scriptInPortRef.current);
    if (scriptIn) {
      qOutPortRefs.current.forEach((qOutEl, idx) => {
        const qOut = getPortCoord(qOutEl);
        if (qOut) {
          const dx = Math.abs(scriptIn.x - qOut.x) * 0.55;
          newCables.push({
            id: `q-script-${idx}`,
            d: `M ${qOut.x} ${qOut.y} C ${qOut.x + dx} ${qOut.y}, ${scriptIn.x - dx} ${qOut.y}, ${scriptIn.x} ${scriptIn.y}`,
            color: '#a855f7',
            width: 2,
          });
        }
      });
    }

    // 3. Script -> Buckets
    const scriptOut1 = getPortCoord(scriptOut1Ref.current);
    const scriptOut2 = getPortCoord(scriptOut2Ref.current);
    const bucket0In = getPortCoord(bucketInPortRefs.current[0]);
    const bucket1In = getPortCoord(bucketInPortRefs.current[1]);

    if (scriptOut1 && bucket0In) {
      const dx = Math.abs(bucket0In.x - scriptOut1.x) * 0.55;
      newCables.push({
        id: 'script-bucket-0',
        d: `M ${scriptOut1.x} ${scriptOut1.y} C ${scriptOut1.x + dx} ${scriptOut1.y}, ${bucket0In.x - dx} ${bucket0In.y}, ${bucket0In.x} ${bucket0In.y}`,
        color: '#10b981',
        width: 2.5,
      });
    }

    if (scriptOut2 && bucket1In) {
      const isWarning = config.destinationBuckets[1]?.intent === 'warning';
      const dx = Math.abs(bucket1In.x - scriptOut2.x) * 0.55;
      newCables.push({
        id: 'script-bucket-1',
        d: `M ${scriptOut2.x} ${scriptOut2.y} C ${scriptOut2.x + dx} ${scriptOut2.y}, ${bucket1In.x - dx} ${bucket1In.y}, ${bucket1In.x} ${bucket1In.y}`,
        color: isWarning ? '#f59e0b' : '#f43f5e',
        width: 2.5,
      });
    }

    setCables(newCables);
  }, [config.destinationBuckets]);

  useLayoutEffect(() => {
    calculateCables();
    const el = canvasRef.current;
    if (!el) return;

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        calculateCables();
      });
      observer.observe(el);
    }

    const handleResize = () => calculateCables();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(calculateCables, 80);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [calculateCables, config]);

  return (
    <div
      ref={canvasRef}
      style={{
        position: 'relative',
        backgroundColor: '#030712',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        borderRadius: tokens.radii.xl,
        border: '1px solid #1e293b',
        padding: tokens.spacing[6],
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes flow-particles {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 15px -3px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.6); }
          50% { box-shadow: 0 0 25px 2px rgba(99, 102, 241, 0.8), 0 0 0 2px rgba(99, 102, 241, 1); }
        }
        .active-cable {
          stroke-dasharray: 4 6;
          animation: flow-particles 1.2s linear infinite;
        }
        .node-script-pulse {
          animation: pulse-ring 3s infinite ease-in-out;
        }
      `}</style>

      {/* Header bar inside Canvas */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b',
          paddingBottom: tokens.spacing[3],
          marginBottom: tokens.spacing[5],
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#818cf8',
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
                padding: `2px ${tokens.spacing[2]}`,
                borderRadius: tokens.radii.sm,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.4)',
              }}
            >
              {config.stageType.toUpperCase()} AI + SCRIPT RULES
            </span>
          </div>
          <h2
            style={{
              margin: '4px 0 0 0',
              fontSize: '16px',
              fontWeight: 700,
              color: '#f8fafc',
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
              color: '#94a3b8',
              backgroundColor: '#0f172a',
              padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
              borderRadius: tokens.radii.md,
              border: '1px solid #1e293b',
            }}
          >
            Script: <strong style={{ color: '#a5b4fc' }}>{config.scriptLabel}</strong>
          </div>
        )}
      </div>

      {/* SVG Connecting Cables Overlay */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {cables.map((c) => (
          <path
            key={c.id}
            d={c.d}
            stroke={c.color}
            strokeWidth={c.width}
            fill="none"
            className="active-cable"
            opacity={0.85}
          />
        ))}
      </svg>

      {/* 4-Column Node Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            config.questionNodes.length > 1
              ? '2.5fr 4.8fr 3.4fr 2.5fr'
              : '3fr 3.3fr 3.4fr 2.5fr',
          gap: tokens.spacing[5],
          alignItems: 'center',
          minHeight: '480px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* 1. Source Inputs Node */}
        <div
          style={{
            backgroundColor: '#0b0f19',
            border: '2px solid rgba(6, 182, 212, 0.8)',
            borderRadius: tokens.radii.xl,
            padding: tokens.spacing[4],
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2],
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #1e293b',
              paddingBottom: tokens.spacing[1],
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#22d3ee',
                textTransform: 'uppercase',
              }}
            >
              {config.source.label}
            </span>
            {config.source.sublabel && (
              <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                {config.source.sublabel}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: '#ffffff',
            }}
          >
            {config.source.count.toLocaleString()}
          </div>

          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {config.source.sublabel ? `${config.source.sublabel} Items` : 'Candidate Items'}
          </div>

          {config.source.description && (
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: '#64748b',
                fontFamily: 'monospace',
                lineHeight: 1.4,
              }}
            >
              {config.source.description}
            </p>
          )}

          {onSelectSlice && (
            <button
              type="button"
              onClick={() => onSelectSlice('all', config.source.label, config.source.count)}
              style={{
                marginTop: tokens.spacing[1],
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#22d3ee',
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

          {/* Output port on the right */}
          <div
            ref={srcPortRef}
            style={{
              position: 'absolute',
              right: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#22d3ee',
              border: '2px solid #030712',
              boxShadow: '0 0 8px rgba(34, 211, 238, 0.8)',
            }}
          />
        </div>

        {/* 2. Question / Operation Nodes (Choice / Score) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[3],
          }}
        >
          {config.questionNodes.map((node, idx) => {
            const isScore = node.type === 'score';
            const borderColor = isScore ? '#f59e0b' : '#06b6d4';
            const badgeBg = isScore ? 'rgba(245, 158, 11, 0.15)' : 'rgba(6, 182, 212, 0.15)';
            const badgeColor = isScore ? '#f59e0b' : '#22d3ee';
            const portColor = isScore ? '#f59e0b' : '#22d3ee';

            return (
              <div
                key={node.id}
                style={{
                  backgroundColor: '#0b0f19',
                  border: `2px solid ${borderColor}`,
                  borderRadius: tokens.radii.xl,
                  padding: tokens.spacing[3],
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                }}
              >
                {/* Left input port */}
                <div
                  ref={(el) => {
                    qInPortRefs.current[idx] = el;
                  }}
                  style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: portColor,
                    border: '2px solid #030712',
                  }}
                />

                {/* Right output port */}
                <div
                  ref={(el) => {
                    qOutPortRefs.current[idx] = el;
                  }}
                  style={{
                    position: 'absolute',
                    right: '-7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#c084fc',
                    border: '2px solid #030712',
                    boxShadow: '0 0 6px rgba(192, 132, 252, 0.7)',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {node.title}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: `2px ${tokens.spacing[1]}`,
                      borderRadius: tokens.radii.sm,
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      border: `1px solid ${badgeColor}`,
                    }}
                  >
                    {node.type.toUpperCase()}
                  </span>
                </div>

                {node.subtitle && (
                  <p
                    style={{
                      margin: `0 0 ${tokens.spacing[2]} 0`,
                      fontSize: '11px',
                      color: '#94a3b8',
                      fontFamily: 'monospace',
                    }}
                  >
                    {node.subtitle}
                  </p>
                )}

                {/* Choice Node Strips */}
                {node.type === 'choice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(node as ChoiceNodeConfig).options.map((opt) => (
                      <div
                        key={opt.key}
                        onClick={() =>
                          onSelectSlice?.(opt.key, `${node.title} • ${opt.label}`, opt.count)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onSelectSlice?.(opt.key, `${node.title} • ${opt.label}`, opt.count);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: `4px ${tokens.spacing[2]}`,
                          borderRadius: tokens.radii.md,
                          backgroundColor: '#030712',
                          border: `1px solid ${opt.isFlag ? 'rgba(244, 63, 94, 0.4)' : '#1e293b'}`,
                          cursor: onSelectSlice ? 'pointer' : 'default',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            color: opt.isFlag ? '#fb7185' : '#34d399',
                            fontWeight: opt.isFlag ? 700 : 500,
                          }}
                        >
                          {opt.label}
                        </span>
                        <span
                          style={{
                            color: opt.isFlag ? '#fb7185' : '#34d399',
                            fontWeight: 700,
                          }}
                        >
                          {opt.percentage}% ({opt.count.toLocaleString()}) {opt.isFlag ? '→' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Score Node Tiers */}
                {node.type === 'score' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#030712',
                      padding: tokens.spacing[2],
                      borderRadius: tokens.radii.md,
                      border: '1px solid #1e293b',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>
                      Elem/Inter/Adv: <strong style={{ color: '#34d399' }}>92%</strong>
                    </span>
                    <span
                      onClick={() =>
                        onSelectSlice?.('obscure', `${node.title} • Obscure Words`, 193)
                      }
                      style={{
                        color: '#fb7185',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Obscure: 8% (193) &rarr;
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 3. Script / Rule Node (First-Class Citizen) */}
        {config.scriptNode && (
          <div
            onClick={() => onSelectScript?.(config.scriptNode!)}
            className="node-script-pulse"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectScript?.(config.scriptNode!);
              }
            }}
            style={{
              backgroundColor: '#0b0f19',
              border: '2px solid #6366f1',
              borderRadius: tokens.radii.xl,
              padding: tokens.spacing[4],
              boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.25)',
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
            }}
          >
            {/* Left input port */}
            <div
              ref={scriptInPortRef}
              style={{
                position: 'absolute',
                left: '-7px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#c084fc',
                border: '2px solid #030712',
              }}
            />

            {/* Right top output port (clean/pass) */}
            <div
              ref={scriptOut1Ref}
              style={{
                position: 'absolute',
                right: '-7px',
                top: '36px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#34d399',
                border: '2px solid #030712',
                boxShadow: '0 0 6px rgba(52, 211, 153, 0.7)',
              }}
            />

            {/* Right bottom output port (prune/queue) */}
            <div
              ref={scriptOut2Ref}
              style={{
                position: 'absolute',
                right: '-7px',
                bottom: '36px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor:
                  config.destinationBuckets[1]?.intent === 'warning' ? '#fbbf24' : '#fb7185',
                border: '2px solid #030712',
                boxShadow: '0 0 6px rgba(251, 113, 133, 0.7)',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #1e293b',
                paddingBottom: tokens.spacing[1],
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: `2px ${tokens.spacing[1]}`,
                    borderRadius: tokens.radii.sm,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                  }}
                >
                  &lt;/&gt; SCRIPT RULE
                </span>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#818cf8',
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: '#a5b4fc',
                  textDecoration: 'underline',
                }}
              >
                View Code
              </span>
            </div>

            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: '#ffffff',
                }}
              >
                {config.scriptNode.title}
              </div>
              {config.scriptNode.subtitle && (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginTop: '2px',
                  }}
                >
                  {config.scriptNode.subtitle}
                </div>
              )}
            </div>

            {/* Code Snippet Box */}
            <div
              style={{
                backgroundColor: '#030712',
                border: '1px solid #1e293b',
                borderRadius: tokens.radii.md,
                padding: tokens.spacing[2],
                fontSize: '10px',
                fontFamily: 'monospace',
                lineHeight: 1.45,
                color: '#e2e8f0',
                overflowX: 'auto',
                whiteSpace: 'pre',
              }}
            >
              {config.scriptNode.codeSnippet}
            </div>

            {config.scriptNode.decisionStats && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #1e293b',
                  paddingTop: tokens.spacing[1],
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                <span style={{ color: '#fb7185', fontWeight: 700 }}>
                  {config.scriptNode.decisionStats.primaryCount}{' '}
                  {config.scriptNode.decisionStats.primaryLabel}
                </span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>
                  {config.scriptNode.decisionStats.secondaryCount}{' '}
                  {config.scriptNode.decisionStats.secondaryLabel}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 4. Destination Buckets Node */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[4],
          }}
        >
          {config.destinationBuckets.map((bucket, bIdx) => {
            const isClean = bIdx === 0;
            const isWarning = bucket.intent === 'warning';
            const borderColor = isClean ? '#10b981' : isWarning ? '#f59e0b' : '#f43f5e';
            const tagColor = isClean ? '#34d399' : isWarning ? '#fbbf24' : '#fb7185';
            const portColor = isClean ? '#34d399' : isWarning ? '#fbbf24' : '#fb7185';

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
                  backgroundColor: '#0b0f19',
                  border: `2px solid ${borderColor}`,
                  borderRadius: tokens.radii.xl,
                  padding: tokens.spacing[3],
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  cursor: onSelectSlice ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {/* Left input port */}
                <div
                  ref={(el) => {
                    bucketInPortRefs.current[bIdx] = el;
                  }}
                  style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: portColor,
                    border: '2px solid #030712',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: tagColor,
                    textTransform: 'uppercase',
                  }}
                >
                  <span>{bucket.title}</span>
                  <span>
                    {isClean ? '✓' : '!'}{' '}
                    {bucket.percentage ? `${bucket.percentage}%` : ''}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: '#ffffff',
                  }}
                >
                  {bucket.count.toLocaleString()} words
                </div>

                {bucket.subtitle && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '10px',
                      color: '#94a3b8',
                      fontFamily: 'monospace',
                    }}
                  >
                    {bucket.subtitle}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
