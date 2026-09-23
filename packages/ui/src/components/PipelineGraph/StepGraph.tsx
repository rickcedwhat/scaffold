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
  wrap = false,
}: StepGraphProps) {
  const { colors, tokens } = useTheme();

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
            color: colors.intent.primary.main,
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
            color: colors.intent.primary.main,
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
        color: colors.intent.success.main,
        width: 2.5,
      });
    }

    if (scriptOut2 && bucket1In) {
      const isWarning = config.destinationBuckets[1]?.intent === 'warning';
      const dx = Math.abs(bucket1In.x - scriptOut2.x) * 0.55;
      newCables.push({
        id: 'script-bucket-1',
        d: `M ${scriptOut2.x} ${scriptOut2.y} C ${scriptOut2.x + dx} ${scriptOut2.y}, ${bucket1In.x - dx} ${bucket1In.y}, ${bucket1In.x} ${bucket1In.y}`,
        color: isWarning ? colors.intent.secondary.main : colors.intent.danger.main,
        width: 2.5,
      });
    }

    setCables(newCables);
  }, [colors, config.destinationBuckets]);

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
        backgroundColor: colors.bg.canvas,
        backgroundImage: `radial-gradient(${colors.border.subtle} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        borderRadius: tokens.radii.xl,
        border: `1px solid ${colors.border.subtle}`,
        padding: tokens.spacing[6],
        boxShadow: tokens.shadows.xl,
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
          0%, 100% { box-shadow: 0 0 15px -3px color-mix(in srgb, ${colors.intent.primary.main} 40%, transparent), 0 0 0 1px ${colors.intent.primary.main}; }
          50% { box-shadow: 0 0 25px 2px color-mix(in srgb, ${colors.intent.primary.main} 70%, transparent), 0 0 0 2px ${colors.intent.primary.hover}; }
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
          borderBottom: `1px solid ${colors.border.subtle}`,
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
                backgroundColor: colors.bg.canvas,
                border: `1px solid ${colors.border.default}`,
                borderRadius: tokens.radii.md,
                padding: `6px ${tokens.spacing[3]}`,
                color: colors.text.primary,
                fontSize: tokens.typography.fontSize.xs,
                fontFamily: tokens.typography.fontFamily.mono,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.intent.primary.main;
                e.currentTarget.style.backgroundColor = colors.intent.primary.subtle;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border.default;
                e.currentTarget.style.backgroundColor = colors.bg.canvas;
              }}
            >
              &larr; All Stages
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontWeight: 700,
                  color: colors.intent.primary.main,
                  textTransform: 'uppercase',
                }}
              >
                STAGE ARCHITECTURE
              </span>
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontWeight: 700,
                  padding: `2px ${tokens.spacing[2]}`,
                  borderRadius: tokens.radii.sm,
                  backgroundColor: colors.intent.primary.subtle,
                  color: colors.intent.primary.main,
                  border: `1px solid ${colors.intent.primary.main}`,
                }}
              >
                {config.stageType.toUpperCase()} AI + SCRIPT RULES
              </span>
            </div>
            <h2
              style={{
                margin: '4px 0 0 0',
                fontSize: tokens.typography.fontSize.base,
                fontWeight: 700,
                color: colors.text.primary,
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
                fontSize: tokens.typography.fontSize.xs,
                fontFamily: tokens.typography.fontFamily.mono,
                color: colors.text.secondary,
                backgroundColor: colors.bg.subtle,
                padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                borderRadius: tokens.radii.md,
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              Script: <strong style={{ color: colors.intent.primary.main }}>{config.scriptLabel}</strong>
            </div>
          )}

          {/* Prev / Next Step Navigator */}
          {(onPrev || onNext) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: colors.bg.canvas,
                border: `1px solid ${colors.border.default}`,
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
                  fontSize: tokens.typography.fontSize.xs,
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontWeight: 700,
                  color: onPrev ? colors.text.primary : colors.text.muted,
                  cursor: onPrev ? 'pointer' : 'not-allowed',
                }}
              >
                &larr; Prev
              </button>
              <span style={{ color: colors.border.default, fontSize: tokens.typography.fontSize.xs }}>|</span>
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
                  fontSize: tokens.typography.fontSize.xs,
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontWeight: 700,
                  color: onNext ? colors.text.primary : colors.text.muted,
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
          gridTemplateColumns: wrap
            ? 'repeat(auto-fit, minmax(220px, 1fr))'
            : config.questionNodes.length > 1
              ? '2.5fr 4.2fr 3.3fr 2.5fr'
              : '2.8fr 3.2fr 3.2fr 2.6fr',
          gap: tokens.spacing[5],
          alignItems: 'center',
          minHeight: wrap ? undefined : '440px',
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
              backgroundColor: colors.bg.surface,
              border: `2px solid ${colors.intent.primary.main}`,
              borderRadius: tokens.radii.xl,
              padding: tokens.spacing[4],
              boxShadow: tokens.shadows.lg,
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
                backgroundColor: colors.intent.primary.subtle,
                border: `1px solid ${colors.intent.primary.main}`,
                color: colors.intent.primary.main,
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
                fontSize: tokens.typography.fontSize.xs,
                fontFamily: tokens.typography.fontFamily.mono,
                textTransform: 'uppercase',
                color: colors.intent.primary.main,
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {config.source.label}
            </div>

            <div
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: 700,
                fontFamily: tokens.typography.fontFamily.mono,
                color: colors.text.primary,
                margin: '2px 0',
              }}
            >
              {config.source.count.toLocaleString()}
            </div>

            <div
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontFamily: tokens.typography.fontFamily.mono,
                color: colors.text.secondary,
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
                backgroundColor: colors.intent.primary.main,
                border: `2px solid ${colors.bg.canvas}`,
                boxShadow: `0 0 8px ${colors.intent.primary.main}`,
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
              backgroundColor: colors.bg.canvas,
              border: `1px solid ${colors.intent.primary.main}`,
              borderRadius: tokens.radii.lg,
              padding: tokens.spacing[3],
              boxShadow: tokens.shadows.xl,
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
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: 700,
                color: colors.intent.primary.main,
                fontFamily: tokens.typography.fontFamily.mono,
                marginBottom: '4px',
              }}
            >
              {config.source.label} Stream
            </div>
            <p style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: colors.text.secondary, lineHeight: 1.4 }}>
              {config.source.description ||
                `${config.source.count.toLocaleString()} candidate tokens filtered for pipeline processing.`}
            </p>
            {onSelectSlice && (
              <button
                type="button"
                onClick={() => onSelectSlice('all', config.source.label, config.source.count)}
                style={{
                  marginTop: '8px',
                  fontSize: tokens.typography.fontSize.xs,
                  fontFamily: tokens.typography.fontFamily.mono,
                  color: colors.intent.primary.main,
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
            const borderColor = isScore ? colors.intent.secondary.main : colors.intent.primary.main;
            const badgeBg = isScore
              ? colors.intent.secondary.subtle
              : colors.intent.primary.subtle;
            const badgeColor = isScore ? colors.intent.secondary.main : colors.intent.primary.main;
            const portColor = isScore ? colors.intent.secondary.main : colors.intent.primary.main;

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
                    backgroundColor: colors.bg.surface,
                    border: `2px solid ${borderColor}`,
                    borderRadius: tokens.radii.xl,
                    padding: tokens.spacing[4],
                    boxShadow: tokens.shadows.lg,
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
                      border: `2px solid ${colors.bg.canvas}`,
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
                      backgroundColor: colors.intent.primary.hover,
                      border: `2px solid ${colors.bg.canvas}`,
                      boxShadow: `0 0 8px ${colors.intent.primary.hover}`,
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
                        fontSize: tokens.typography.fontSize.xs,
                        fontFamily: tokens.typography.fontFamily.mono,
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
                          fontSize: tokens.typography.fontSize.xs,
                          fontFamily: tokens.typography.fontFamily.mono,
                          color: colors.intent.primary.hover,
                          fontWeight: 700,
                        }}
                      >
                        {(node as ChoiceNodeConfig).throughput}
                      </span>
                    ) : isScore ? (
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontFamily: tokens.typography.fontFamily.mono,
                          color: colors.intent.secondary.main,
                          fontWeight: 700,
                        }}
                      >
                        &ge; {(node as ScoreNodeConfig).cutoffValue}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontFamily: tokens.typography.fontFamily.mono,
                          color: colors.text.secondary,
                        }}
                      >
                        parallel
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: 700,
                      color: colors.text.primary,
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
                      backgroundColor: colors.bg.canvas,
                      display: 'flex',
                      overflow: 'hidden',
                      boxShadow: tokens.shadows.sm,
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    {node.type === 'choice'
                      ? (node as ChoiceNodeConfig).options.map((opt, optIdx) => {
                          const segmentColors = [
                            colors.intent.success.main,
                            colors.intent.danger.main,
                            colors.intent.secondary.main,
                            colors.intent.primary.main,
                          ];
                          const segColor = opt.isFlag
                            ? segmentColors[(optIdx % (segmentColors.length - 1)) + 1]
                            : colors.intent.success.main;
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
                          const segmentColors = [
                            colors.intent.success.main,
                            colors.intent.primary.main,
                            colors.intent.secondary.main,
                            colors.intent.danger.main,
                          ];
                          const segColor = tier.isFlag
                            ? colors.intent.danger.main
                            : segmentColors[tIdx % segmentColors.length];
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
                      fontSize: tokens.typography.fontSize.xs,
                      fontFamily: tokens.typography.fontFamily.mono,
                    }}
                  >
                    <span style={{ color: colors.intent.success.main, fontWeight: 700 }}>
                      {passPercentage}% {isScore ? 'Pass' : 'Valid'}
                    </span>
                    <span
                      style={{
                        color: flagPercentage > 0 ? colors.intent.danger.main : colors.text.secondary,
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
                    backgroundColor: colors.bg.canvas,
                    border: `1px solid ${borderColor}`,
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing[3],
                    boxShadow: tokens.shadows.xl,
                    width: '280px',
                    boxSizing: 'border-box',
                    fontFamily: tokens.typography.fontFamily.mono,
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
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: 700,
                      color: badgeColor,
                      marginBottom: '2px',
                    }}
                  >
                    {node.title} Breakdown
                  </div>
                  {node.subtitle && (
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: colors.text.secondary, marginBottom: '8px' }}>
                      {node.subtitle}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      borderTop: `1px solid ${colors.border.subtle}`,
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
                              backgroundColor: colors.bg.canvas,
                              border: `1px solid ${opt.isFlag ? colors.intent.danger.main : colors.border.subtle}`,
                              cursor: onSelectSlice ? 'pointer' : 'default',
                              fontSize: tokens.typography.fontSize.xs,
                              transition: 'border-color 0.15s ease, background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.bg.subtle;
                              e.currentTarget.style.borderColor = opt.isFlag
                                ? colors.intent.danger.main
                                : colors.intent.success.main;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = colors.bg.canvas;
                              e.currentTarget.style.borderColor = opt.isFlag
                                ? colors.intent.danger.main
                                : colors.border.subtle;
                            }}
                          >
                            <span
                              style={{
                                color: opt.isFlag ? colors.intent.danger.main : colors.intent.success.main,
                                fontWeight: opt.isFlag ? 700 : 500,
                              }}
                            >
                              &bull; {opt.label}
                            </span>
                            <span
                              style={{
                                color: opt.isFlag ? colors.intent.danger.main : colors.intent.success.main,
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
                              backgroundColor: colors.bg.canvas,
                              border: `1px solid ${tier.isFlag ? colors.intent.danger.main : colors.border.subtle}`,
                              cursor: onSelectSlice ? 'pointer' : 'default',
                              fontSize: tokens.typography.fontSize.xs,
                              transition: 'border-color 0.15s ease, background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.bg.subtle;
                              e.currentTarget.style.borderColor = tier.isFlag
                                ? colors.intent.danger.main
                                : colors.intent.success.main;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = colors.bg.canvas;
                              e.currentTarget.style.borderColor = tier.isFlag
                                ? colors.intent.danger.main
                                : colors.border.subtle;
                            }}
                          >
                            <span
                              style={{
                                color: tier.isFlag ? colors.intent.danger.main : colors.intent.success.main,
                                fontWeight: tier.isFlag ? 700 : 500,
                              }}
                            >
                              &bull; {tier.label}
                            </span>
                            <span
                              style={{
                                color: tier.isFlag ? colors.intent.danger.main : colors.intent.success.main,
                                fontWeight: 700,
                              }}
                            >
                              {tier.percentage}% ({tier.count.toLocaleString()})
                            </span>
                          </div>
                        ))}
                  </div>

                  <div style={{ marginTop: '8px', fontSize: tokens.typography.fontSize.xs, color: colors.text.muted }}>
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
                backgroundColor: colors.bg.surface,
                border: `2px solid ${colors.intent.primary.main}`,
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
                  backgroundColor: colors.intent.primary.hover,
                  border: `2px solid ${colors.bg.canvas}`,
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
                  backgroundColor: colors.intent.success.main,
                  border: `2px solid ${colors.bg.canvas}`,
                  boxShadow: `0 0 8px ${colors.intent.success.main}`,
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
                    config.destinationBuckets[1]?.intent === 'warning' ? colors.intent.secondary.main : colors.intent.danger.main,
                  border: `2px solid ${colors.bg.canvas}`,
                  boxShadow: `0 0 8px ${colors.intent.danger.main}`,
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
                    fontSize: tokens.typography.fontSize.xs,
                    fontFamily: tokens.typography.fontFamily.mono,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: tokens.radii.sm,
                    backgroundColor: colors.intent.primary.subtle,
                    color: colors.intent.primary.main,
                    border: `1px solid ${colors.intent.primary.main}`,
                  }}
                >
                  &lt;/&gt; SCRIPT RULE
                </span>
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontFamily: tokens.typography.fontFamily.mono,
                    color: colors.intent.primary.main,
                    textDecoration: 'underline',
                  }}
                >
                  inspect
                </span>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: 700,
                  fontFamily: tokens.typography.fontFamily.mono,
                  color: colors.text.primary,
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
                  backgroundColor: colors.bg.canvas,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: tokens.radii.md,
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontSize: tokens.typography.fontSize.xs,
                  color: colors.intent.primary.main,
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
                    fontSize: tokens.typography.fontSize.xs,
                    fontFamily: tokens.typography.fontFamily.mono,
                  }}
                >
                  <span style={{ color: colors.intent.danger.main, fontWeight: 700 }}>
                    &bull; {config.scriptNode.decisionStats.primaryCount}{' '}
                    {config.scriptNode.decisionStats.primaryLabel}
                  </span>
                  <span style={{ color: colors.intent.success.main, fontWeight: 700 }}>
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
                backgroundColor: colors.bg.canvas,
                border: `1px solid ${colors.intent.primary.main}`,
                borderRadius: tokens.radii.lg,
                padding: tokens.spacing[3],
                boxShadow: tokens.shadows.xl,
                width: '320px',
                boxSizing: 'border-box',
                fontFamily: tokens.typography.fontFamily.mono,
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
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: 700,
                  color: colors.intent.primary.main,
                  marginBottom: '4px',
                }}
              >
                <span>{config.scriptNode.filePath || 'Rule Implementation'}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: colors.text.muted }}>active</span>
              </div>

              <pre
                style={{
                  backgroundColor: colors.bg.canvas,
                  padding: '8px',
                  borderRadius: tokens.radii.md,
                  border: `1px solid ${colors.border.subtle}`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: colors.text.primary,
                  lineHeight: 1.4,
                  margin: '6px 0',
                  overflowX: 'auto',
                  whiteSpace: 'pre',
                }}
              >
                {config.scriptNode.codeSnippet}
              </pre>

              <div style={{ fontSize: tokens.typography.fontSize.xs, color: colors.intent.primary.main, marginTop: '6px' }}>
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
            const borderColor = isClean ? colors.intent.success.main : isWarning ? colors.intent.secondary.main : colors.intent.danger.main;
            const tagColor = isClean ? colors.intent.success.main : isWarning ? colors.intent.secondary.main : colors.intent.danger.main;
            const portColor = isClean ? colors.intent.success.main : isWarning ? colors.intent.secondary.main : colors.intent.danger.main;
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
                    backgroundColor: colors.bg.surface,
                    border: `2px solid ${borderColor}`,
                    borderRadius: tokens.radii.xl,
                    padding: tokens.spacing[3],
                    boxShadow: tokens.shadows.lg,
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
                      border: `2px solid ${colors.bg.canvas}`,
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: tokens.typography.fontSize.xs,
                      fontFamily: tokens.typography.fontFamily.mono,
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
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: 700,
                      fontFamily: tokens.typography.fontFamily.mono,
                      color: colors.text.primary,
                    }}
                  >
                    {bucket.count.toLocaleString()} words
                  </div>

                  {bucket.subtitle && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: tokens.typography.fontSize.xs,
                        color: colors.text.secondary,
                        fontFamily: tokens.typography.fontFamily.mono,
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
                    backgroundColor: colors.bg.canvas,
                    border: `1px solid ${borderColor}`,
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing[3],
                    boxShadow: tokens.shadows.xl,
                    width: '240px',
                    boxSizing: 'border-box',
                    fontFamily: tokens.typography.fontFamily.mono,
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
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: 700,
                      color: tagColor,
                      marginBottom: '4px',
                    }}
                  >
                    {bucket.title} ({bucket.count.toLocaleString()} words)
                  </div>
                  <p style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: colors.text.secondary, lineHeight: 1.4 }}>
                    {bucket.description ||
                      (isClean
                        ? 'Verified passing headwords progressing to downstream stages.'
                        : 'Excluded outliers routed to prune log or human review queue.')}
                  </p>
                  <div style={{ marginTop: '6px', fontSize: tokens.typography.fontSize.xs, color: tagColor }}>
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
