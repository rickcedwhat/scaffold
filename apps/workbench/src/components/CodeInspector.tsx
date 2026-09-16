import React, { useState } from 'react';
import { useTheme } from '@scaffold/ui';

export interface CodeFile {
  name: string;
  language?: string;
  content: string;
}

export interface CodeInspectorProps {
  title: string;
  files: CodeFile[];
  isOpen: boolean;
  onClose: () => void;
}

export function CodeInspector({
  title,
  files,
  isOpen,
  onClose,
}: CodeInspectorProps) {
  const { mode, tokens, colors } = useTheme();
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen || files.length === 0) return null;

  const currentFile = files[activeFileIndex] || files[0];
  const lines = currentFile.content.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const isDark = mode === 'dark';
  const editorBg = isDark ? '#0b0f19' : '#1e293b';
  const headerBg = isDark ? '#111827' : '#0f172a';
  const activeTabBg = isDark ? '#0b0f19' : '#1e293b';
  const inactiveTabBg = 'transparent';
  const gutterColor = isDark ? '#4b5563' : '#64748b';
  const textColor = '#f8fafc';

  return (
    <aside
      aria-label="Code Inspector"
      style={{
        width: '560px',
        maxWidth: '100vw',
        height: '100vh',
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 50,
        backgroundColor: editorBg,
        borderLeft: `1px solid ${colors.border.subtle}`,
        boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: tokens.typography.fontFamily.mono,
        animation: 'scaffold-slide-in 0.2s ease-out',
      }}
    >
      {/* IDE Top Window Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: headerBg,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box',
        }}
      >
        {/* macOS Window Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            onClick={onClose}
            title="Close Inspector"
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ff5f56',
              cursor: 'pointer',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ffbd2e',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#27c93f',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              marginLeft: '12px',
              color: '#94a3b8',
              fontSize: '12px',
              fontFamily: tokens.typography.fontFamily.sans,
              fontWeight: 500,
            }}
          >
            Live Code &bull; {title}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              color: copied ? '#4ade80' : '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: tokens.radii.sm,
              padding: '4px 10px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: tokens.typography.fontFamily.sans,
              fontWeight: 500,
              transition: 'background-color 0.15s ease',
            }}
          >
            {copied ? '✓ Copied' : 'Copy Code'}
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close (ESC)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: tokens.radii.sm,
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Editor File Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: headerBg,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          overflowX: 'auto',
        }}
      >
        {files.map((file, idx) => {
          const isActive = idx === activeFileIndex;
          return (
            <button
              key={file.name}
              type="button"
              onClick={() => setActiveFileIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: isActive ? activeTabBg : inactiveTabBg,
                color: isActive ? '#38bdf8' : '#94a3b8',
                border: 'none',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                fontSize: '12px',
                fontFamily: tokens.typography.fontFamily.mono,
                cursor: 'pointer',
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{file.name.endsWith('.test.tsx') ? '🧪' : '📄'}</span>
              <span>{file.name}</span>
            </button>
          );
        })}
      </div>

      {/* Code Editor Body with Gutter */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          padding: '16px 0',
          fontSize: '12px',
          lineHeight: '20px',
        }}
      >
        {/* Line Numbers Gutter */}
        <div
          style={{
            padding: '0 16px 0 16px',
            color: gutterColor,
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            minWidth: '44px',
            boxSizing: 'border-box',
          }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <pre
          style={{
            margin: 0,
            padding: '0 24px',
            color: textColor,
            fontFamily: tokens.typography.fontFamily.mono,
            whiteSpace: 'pre',
            wordWrap: 'normal',
            overflowX: 'visible',
            flex: 1,
          }}
        >
          <code>{currentFile.content}</code>
        </pre>
      </div>

      {/* IDE Status Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          backgroundColor: headerBg,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#94a3b8',
          fontSize: '11px',
          fontFamily: tokens.typography.fontFamily.sans,
        }}
      >
        <span>
          {currentFile.name} &bull; {lines.length} lines
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>UTF-8</span>
          <span>TypeScript JSX</span>
        </span>
      </div>
    </aside>
  );
}
