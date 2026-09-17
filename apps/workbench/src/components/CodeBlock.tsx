import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = true,
  showCopyButton = true,
  maxHeight = '520px',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #27272a',
        backgroundColor: '#18181b',
        boxSizing: 'border-box',
      }}
    >
      {showCopyButton && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy code'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: copied ? '#4ade80' : '#a1a1aa',
              backgroundColor: copied ? 'rgba(34, 197, 94, 0.15)' : '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 500,
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            {copied ? '✓ Copied' : '⧉ Copy'}
          </button>
        </div>
      )}

      <div style={{ maxHeight, overflowY: 'auto' }}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            borderRadius: '8px',
            backgroundColor: '#18181b',
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.6',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
          lineNumberStyle={{
            color: '#3f3f46',
            minWidth: '2.5em',
            paddingRight: '1em',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
