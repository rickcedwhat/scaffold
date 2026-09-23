import React, { useRef, useState, useCallback, useLayoutEffect, useEffect } from 'react';
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
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
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
  onBack,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
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
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [pinnedNodeId, setPinnedNodeId] = useState<string | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback((nodeId: string) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHoveredNodeId(nodeId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setHoveredNodeId(null);
    }, 280);
  }, []);

  const togglePin = useCallback((nodeId: string) => {
    setPinnedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  const calculateCables = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();

    const getPortCoord = (el: HTMLElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
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

    // 2. Questions -> Script
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
        overflow: 'visible',
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
          marginBottom: tokens.spacing[6],
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#090d16',
                border: '1px solid #334155',
                borderRadius: tokens.radii.md,
                padding: `6px ${tokens.spacing[3]}`,
                color: '#f8fafc',
                fontSize: '12px',
                fontFamily: 'monospace',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#818cf8';
                e.currentTarget.style.backgroundColor = '#1e1b4b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.backgroundColor = '#090d16';
              }}
            >
              &larr; All Stages
            </button>
          )}

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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
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

          {/* Prev / Next Step Navigator */}
          {(onPrev || onNext) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#090d16',
                border: '1px solid #334155',
                borderRadius: tokens.radii.md,
                padding: '2px',
                gap: '2px',
              }}
            >
              <button
                type="button"
                disabled={!onPrev}
                onClick={onPrev}
                title={prevLabel ? `Previous: ${prevLabel}` : 'Previous Step'}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: tokens.radii.sm,
                  padding: `5px ${tokens.spacing[2]}`,
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: onPrev ? '#f8fafc' : '#475569',
                  cursor: onPrev ? 'pointer' : 'not-allowed',
                }}
              >
                &larr; Prev
              </button>
              <span style={{ color: '#334155', fontSize: '12px' }}>|</span>
              <button
                type="button"
                disabled={!onNext}
                onClick={onNext}
                title={nextLabel ? `Next: ${nextLabel}` : 'Next Step'}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: tokens.radii.sm,
                  padding: `5px ${tokens.spacing[2]}`,
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: onNext ? '#f8fafc' : '#475569',
                  cursor: onNext ? 'pointer' : 'not-allowed',
                }}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
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

      {/* 4-Column Architecture Diagram Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            config.questionNodes.length > 1
              ? '2.5fr 4.2fr 3.3fr 2.5fr'
              : '2.8fr 3.2fr 3.2fr 2.6fr',
          gap: tokens.spacing[5],
          alignItems: 'center',
          minHeight: '440px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* 1. Source Inputs Node (Compact Token Cylinder Symbol) */}
        <div
          onMouseEnter={() => handleMouseEnter('src')}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={() => onSelectSlice?.('all', config.source.label, config.source.count)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectSlice?.('all', config.source.label, config.source.count);
              }
            }}
            style={{
              backgroundColor: '#0b0f19',
              border: '2px solid #06b6d4',
              borderRadius: tokens.radii.xl,
              padding: tokens.spacing[4],
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              width: '100%',
              maxWidth: '220px',
              textAlign: 'center',
              cursor: onSelectSlice ? 'pointer' : 'default',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            {/* Cylinder / Token Icon */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: tokens.radii.lg,
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                color: '#22d3ee',
                marginBottom: tokens.spacing[2],
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>

            <div
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                color: '#22d3ee',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {config.source.label}
            </div>

            <div
              style={{
                fontSize: '26px',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: '#ffffff',
                margin: '2px 0',
              }}
            >
              {config.source.count.toLocaleString()}
            </div>

            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#94a3b8',
              }}
            >
              {config.source.sublabel || 'Candidate Tokens'}
            </div>

            {/* Right output port */}
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
                boxShadow: '0 0 8px rgba(34, 211, 238, 0.9)',
              }}
            />
          </div>

          {/* Source Popover */}
          <div
            role="tooltip"
            aria-hidden={hoveredNodeId !== 'src' && pinnedNodeId !== 'src'}
            onMouseEnter={() => handleMouseEnter('src')}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transform:
                hoveredNodeId === 'src' || pinnedNodeId === 'src'
                  ? 'translateX(-50%) translateY(0)'
                  : 'translateX(-50%) translateY(4px)',
              opacity: hoveredNodeId === 'src' || pinnedNodeId === 'src' ? 1 : 0,
              visibility:
                hoveredNodeId === 'src' || pinnedNodeId === 'src' ? 'visible' : 'hidden',
              pointerEvents:
                hoveredNodeId === 'src' || pinnedNodeId === 'src' ? 'auto' : 'none',
              transition:
                'opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 50,
              backgroundColor: '#090d16',
              border: '1px solid rgba(6, 182, 212, 0.6)',
              borderRadius: tokens.radii.lg,
              padding: tokens.spacing[3],
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.85)',
              width: '260px',
              boxSizing: 'border-box',
            }}
          >
            {/* Invisible bridge over the 8px gap */}
            <div
              style={{
                position: 'absolute',
                top: '-14px',
                left: '-10px',
                right: '-10px',
                height: '16px',
                backgroundColor: 'transparent',
                pointerEvents: 'auto',
              }}
            />

            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#22d3ee',
                fontFamily: 'monospace',
                marginBottom: '4px',
              }}
            >
              {config.source.label} Stream
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
              {config.source.description ||
                `${config.source.count.toLocaleString()} candidate tokens filtered for pipeline processing.`}
            </p>
            {onSelectSlice && (
              <button
                type="button"
                onClick={() => onSelectSlice('all', config.source.label, config.source.count)}
                style={{
                  marginTop: '8px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: '#22d3ee',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'block',
                }}
              >
                Click node to browse input sample &rarr;
              </button>
            )}
          </div>
        </div>

        {/* 2. Question / Evaluator Nodes (Choice / Score) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[4],
          }}
        >
          {config.questionNodes.map((node, idx) => {
            const isScore = node.type === 'score';
            const qId = `q-${idx}`;
            const isVisible = hoveredNodeId === qId || pinnedNodeId === qId;
            const borderColor = isScore ? '#f59e0b' : '#a855f7';
            const badgeBg = isScore ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)';
            const badgeColor = isScore ? '#fbbf24' : '#d8b4fe';
            const portColor = isScore ? '#f59e0b' : '#22d3ee';

            // Calculate percentages for summary
            let passPercentage = 0;
            let flagPercentage = 0;
            if (node.type === 'choice') {
              const choiceNode = node as ChoiceNodeConfig;
              choiceNode.options.forEach((opt) => {
                if (opt.isFlag) flagPercentage += opt.percentage;
                else passPercentage += opt.percentage;
              });
            } else {
              const scoreNode = node as ScoreNodeConfig;
              scoreNode.tiers.forEach((tier) => {
                if (tier.isFlag) flagPercentage += tier.percentage;
                else passPercentage += tier.percentage;
              });
            }
            passPercentage = Math.round(passPercentage * 10) / 10;
            flagPercentage = Math.round(flagPercentage * 10) / 10;

            return (
              <div
                key={node.id}
                onMouseEnter={() => handleMouseEnter(qId)}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <div
                  onClick={() => togglePin(qId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      togglePin(qId);
                    }
                  }}
                  style={{
                    backgroundColor: '#0b0f19',
                    border: `2px solid ${borderColor}`,
                    borderRadius: tokens.radii.xl,
                    padding: tokens.spacing[4],
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                    position: 'relative',
                    width: '100%',
                    maxWidth: '240px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  {/* Left in port */}
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

                  {/* Right out port */}
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
                      boxShadow: '0 0 8px rgba(192, 132, 252, 0.9)',
                    }}
                  />

                  {/* Header row */}
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
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: tokens.radii.sm,
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}`,
                      }}
                    >
                      {isScore ? '⚡ SCORE EVAL' : '⚡ JEV SYSTEM 1'}
                    </span>
                    {node.type === 'choice' && (node as ChoiceNodeConfig).throughput ? (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: '#c084fc',
                          fontWeight: 700,
                        }}
                      >
                        {(node as ChoiceNodeConfig).throughput}
                      </span>
                    ) : isScore ? (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: '#fbbf24',
                          fontWeight: 700,
                        }}
                      >
                        &ge; {(node as ScoreNodeConfig).cutoffValue}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          color: '#94a3b8',
                        }}
                      >
                        parallel
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    {node.title}
                  </div>

                  {/* Segmented Distribution Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '10px',
                      borderRadius: '9999px',
                      backgroundColor: '#030712',
                      display: 'flex',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    {node.type === 'choice'
                      ? (node as ChoiceNodeConfig).options.map((opt, optIdx) => {
                          const colors = ['#10b981', '#f43f5e', '#f59e0b', '#a855f7', '#06b6d4'];
                          const segColor = opt.isFlag
                            ? colors[(optIdx % (colors.length - 1)) + 1]
                            : '#10b981';
                          return (
                            <div
                              key={opt.key}
                              style={{
                                width: `${opt.percentage}%`,
                                height: '100%',
                                backgroundColor: segColor,
                              }}
                              title={`${opt.label}: ${opt.percentage}% (${opt.count.toLocaleString()})`}
                            />
                          );
                        })
                      : (node as ScoreNodeConfig).tiers.map((tier, tIdx) => {
                          const colors = ['#10b981', '#06b6d4', '#f59e0b', '#f43f5e'];
                          const segColor = tier.isFlag ? '#f43f5e' : colors[tIdx % colors.length];
                          return (
                            <div
                              key={tier.key}
                              style={{
                                width: `${tier.percentage}%`,
                                height: '100%',
                                backgroundColor: segColor,
                              }}
                              title={`${tier.label}: ${tier.percentage}% (${tier.count.toLocaleString()})`}
                            />
                          );
                        })}
                  </div>

                  {/* Summary metric line below bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ color: '#34d399', fontWeight: 700 }}>
                      {passPercentage}% {isScore ? 'Pass' : 'Valid'}
                    </span>
                    <span
                      style={{
                        color: flagPercentage > 0 ? '#fb7185' : '#94a3b8',
                        fontWeight: 700,
                      }}
                    >
                      {flagPercentage}% {isScore ? 'Obscure' : 'Flags'}
                    </span>
                  </div>
                </div>

                {/* Evaluator Hover Popover */}
                <div
                  role="tooltip"
                  aria-hidden={!isVisible}
                  onMouseEnter={() => handleMouseEnter(qId)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '50%',
                    transform: isVisible
                      ? 'translateX(-50%) translateY(0)'
                      : 'translateX(-50%) translateY(4px)',
                    opacity: isVisible ? 1 : 0,
                    visibility: isVisible ? 'visible' : 'hidden',
                    pointerEvents: isVisible ? 'auto' : 'none',
                    transition:
                      'opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 50,
                    backgroundColor: '#090d16',
                    border: `1px solid ${borderColor}`,
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing[3],
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.85)',
                    width: '280px',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                >
                  {/* Invisible bridge over the 8px gap */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '-10px',
                      right: '-10px',
                      height: '16px',
                      backgroundColor: 'transparent',
                      pointerEvents: 'auto',
                    }}
                  />

                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: badgeColor,
                      marginBottom: '2px',
                    }}
                  >
                    {node.title} Breakdown
                  </div>
                  {node.subtitle && (
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>
                      {node.subtitle}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      borderTop: '1px solid #1e293b',
                      paddingTop: '6px',
                    }}
                  >
                    {node.type === 'choice'
                      ? (node as ChoiceNodeConfig).options.map((opt) => (
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
                              padding: '4px 6px',
                              borderRadius: tokens.radii.sm,
                              backgroundColor: '#030712',
                              border: `1px solid ${opt.isFlag ? 'rgba(244, 63, 94, 0.3)' : '#1e293b'}`,
                              cursor: onSelectSlice ? 'pointer' : 'default',
                              fontSize: '10px',
                              transition: 'border-color 0.15s ease, background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#111827';
                              e.currentTarget.style.borderColor = opt.isFlag
                                ? '#f43f5e'
                                : '#10b981';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#030712';
                              e.currentTarget.style.borderColor = opt.isFlag
                                ? 'rgba(244, 63, 94, 0.3)'
                                : '#1e293b';
                            }}
                          >
                            <span
                              style={{
                                color: opt.isFlag ? '#fb7185' : '#34d399',
                                fontWeight: opt.isFlag ? 700 : 500,
                              }}
                            >
                              &bull; {opt.label}
                            </span>
                            <span
                              style={{
                                color: opt.isFlag ? '#fb7185' : '#34d399',
                                fontWeight: 700,
                              }}
                            >
                              {opt.percentage}% ({opt.count.toLocaleString()}){' '}
                              {opt.isFlag ? '→' : ''}
                            </span>
                          </div>
                        ))
                      : (node as ScoreNodeConfig).tiers.map((tier) => (
                          <div
                            key={tier.key}
                            onClick={() =>
                              onSelectSlice?.(tier.key, `${node.title} • ${tier.label}`, tier.count)
                            }
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                onSelectSlice?.(
                                  tier.key,
                                  `${node.title} • ${tier.label}`,
                                  tier.count
                                );
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '4px 6px',
                              borderRadius: tokens.radii.sm,
                              backgroundColor: '#030712',
                              border: `1px solid ${tier.isFlag ? 'rgba(244, 63, 94, 0.3)' : '#1e293b'}`,
                              cursor: onSelectSlice ? 'pointer' : 'default',
                              fontSize: '10px',
                              transition: 'border-color 0.15s ease, background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#111827';
                              e.currentTarget.style.borderColor = tier.isFlag
                                ? '#f43f5e'
                                : '#10b981';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#030712';
                              e.currentTarget.style.borderColor = tier.isFlag
                                ? 'rgba(244, 63, 94, 0.3)'
                                : '#1e293b';
                            }}
                          >
                            <span
                              style={{
                                color: tier.isFlag ? '#fb7185' : '#34d399',
                                fontWeight: tier.isFlag ? 700 : 500,
                              }}
                            >
                              &bull; {tier.label}
                            </span>
                            <span
                              style={{
                                color: tier.isFlag ? '#fb7185' : '#34d399',
                                fontWeight: 700,
                              }}
                            >
                              {tier.percentage}% ({tier.count.toLocaleString()})
                            </span>
                          </div>
                        ))}
                  </div>

                  <div style={{ marginTop: '8px', fontSize: '9px', color: '#64748b' }}>
                    Click row to inspect sample words &rarr;
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Script / Rule Node (Compact Glow Chip Symbol) */}
        {config.scriptNode && (
          <div
            onMouseEnter={() => handleMouseEnter('script')}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
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
                position: 'relative',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '240px',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Left in port */}
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

              {/* Top right clean port */}
              <div
                ref={scriptOut1Ref}
                style={{
                  position: 'absolute',
                  right: '-7px',
                  top: '28px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#34d399',
                  border: '2px solid #030712',
                  boxShadow: '0 0 8px rgba(52, 211, 153, 0.9)',
                }}
              />

              {/* Bottom right pruned/queue port */}
              <div
                ref={scriptOut2Ref}
                style={{
                  position: 'absolute',
                  right: '-7px',
                  bottom: '28px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor:
                    config.destinationBuckets[1]?.intent === 'warning' ? '#fbbf24' : '#fb7185',
                  border: '2px solid #030712',
                  boxShadow: '0 0 8px rgba(251, 113, 133, 0.9)',
                }}
              />

              {/* Header row */}
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
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '2px 6px',
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
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#818cf8',
                    textDecoration: 'underline',
                  }}
                >
                  inspect
                </span>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {config.scriptNode.title}
              </div>

              {/* Concise Rule Badge Pill */}
              <div
                style={{
                  margin: '8px 0',
                  padding: '4px 8px',
                  backgroundColor: '#030712',
                  border: '1px solid #1e293b',
                  borderRadius: tokens.radii.md,
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  color: '#a5b4fc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {config.scriptNode.ruleBadge ||
                  config.scriptNode.codeSnippet.split('\n')[0] ||
                  'conf >= 0.70 && !valid'}
              </div>

              {/* Decision Summary */}
              {config.scriptNode.decisionStats && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                >
                  <span style={{ color: '#fb7185', fontWeight: 700 }}>
                    &bull; {config.scriptNode.decisionStats.primaryCount}{' '}
                    {config.scriptNode.decisionStats.primaryLabel}
                  </span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>
                    &bull; {config.scriptNode.decisionStats.secondaryCount}{' '}
                    {config.scriptNode.decisionStats.secondaryLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Script Rule Popover */}
            <div
              role="tooltip"
              aria-hidden={hoveredNodeId !== 'script' && pinnedNodeId !== 'script'}
              onMouseEnter={() => handleMouseEnter('script')}
              onMouseLeave={handleMouseLeave}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: '50%',
                transform:
                  hoveredNodeId === 'script' || pinnedNodeId === 'script'
                    ? 'translateX(-50%) translateY(0)'
                    : 'translateX(-50%) translateY(4px)',
                opacity: hoveredNodeId === 'script' || pinnedNodeId === 'script' ? 1 : 0,
                visibility:
                  hoveredNodeId === 'script' || pinnedNodeId === 'script' ? 'visible' : 'hidden',
                pointerEvents:
                  hoveredNodeId === 'script' || pinnedNodeId === 'script' ? 'auto' : 'none',
                transition:
                  'opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 50,
                backgroundColor: '#090d16',
                border: '1px solid rgba(99, 102, 241, 0.8)',
                borderRadius: tokens.radii.lg,
                padding: tokens.spacing[3],
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.85)',
                width: '320px',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
              }}
            >
              {/* Invisible bridge over the 8px gap */}
              <div
                style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '-10px',
                  right: '-10px',
                  height: '16px',
                  backgroundColor: 'transparent',
                  pointerEvents: 'auto',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#a5b4fc',
                  marginBottom: '4px',
                }}
              >
                <span>{config.scriptNode.filePath || 'Rule Implementation'}</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>active</span>
              </div>

              <pre
                style={{
                  backgroundColor: '#030712',
                  padding: '8px',
                  borderRadius: tokens.radii.md,
                  border: '1px solid #1e293b',
                  fontSize: '10px',
                  color: '#e2e8f0',
                  lineHeight: 1.4,
                  margin: '6px 0',
                  overflowX: 'auto',
                  whiteSpace: 'pre',
                }}
              >
                {config.scriptNode.codeSnippet}
              </pre>

              <div style={{ fontSize: '10px', color: '#818cf8', marginTop: '6px' }}>
                Click node to open full code drawer &rarr;
              </div>
            </div>
          </div>
        )}

        {/* 4. Destination Buckets (Compact Status Capsules) */}
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
            const bucketId = `bucket-${bIdx}`;
            const isVisible = hoveredNodeId === bucketId || pinnedNodeId === bucketId;

            return (
              <div
                key={bucket.id}
                onMouseEnter={() => handleMouseEnter(bucketId)}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: 'relative',
                }}
              >
                <div
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
                    gap: '2px',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  {/* Left in port */}
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

                {/* Bucket Popover */}
                <div
                  role="tooltip"
                  aria-hidden={!isVisible}
                  onMouseEnter={() => handleMouseEnter(bucketId)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    position: 'absolute',
                    ...(isClean
                      ? { top: 'calc(100% + 8px)', right: 0 }
                      : { bottom: 'calc(100% + 8px)', right: 0 }),
                    opacity: isVisible ? 1 : 0,
                    visibility: isVisible ? 'visible' : 'hidden',
                    pointerEvents: isVisible ? 'auto' : 'none',
                    transition:
                      'opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 50,
                    backgroundColor: '#090d16',
                    border: `1px solid ${borderColor}`,
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing[3],
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.85)',
                    width: '240px',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                >
                  {/* Invisible bridge over the 8px gap */}
                  <div
                    style={{
                      position: 'absolute',
                      ...(isClean ? { top: '-14px' } : { bottom: '-14px' }),
                      left: '-10px',
                      right: '-10px',
                      height: '16px',
                      backgroundColor: 'transparent',
                      pointerEvents: 'auto',
                    }}
                  />

                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: tagColor,
                      marginBottom: '4px',
                    }}
                  >
                    {bucket.title} ({bucket.count.toLocaleString()} words)
                  </div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4 }}>
                    {bucket.description ||
                      (isClean
                        ? 'Verified passing headwords progressing to downstream stages.'
                        : 'Excluded outliers routed to prune log or human review queue.')}
                  </p>
                  <div style={{ marginTop: '6px', fontSize: '9px', color: tagColor }}>
                    Click capsule to inspect items &rarr;
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
