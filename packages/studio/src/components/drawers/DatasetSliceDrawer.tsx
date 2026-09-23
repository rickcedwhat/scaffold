import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { useTheme } from '@scaffold/ui';
import type { OutcomeSlice } from '../../types';

export interface DatasetSliceDrawerProps {
  slice: OutcomeSlice | null;
  isOpen: boolean;
  onClose: () => void;
  pageSize?: number;
}

export function DatasetSliceDrawer({
  slice,
  isOpen,
  onClose,
  pageSize = 8,
}: DatasetSliceDrawerProps) {
  const { colors, tokens } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'conf-desc' | 'conf-asc' | 'alpha'>('conf-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const previousSliceKey = useRef<string | null>(slice?.key ?? null);

  useLayoutEffect(() => {
    if (slice && previousSliceKey.current !== slice.key) {
      setSearchQuery('');
      setCurrentPage(1);
      previousSliceKey.current = slice.key;
    }
  }, [slice]);

  const filteredItems = useMemo(() => {
    if (!slice?.items) return [];
    let items = [...slice.items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.contentPreview?.toLowerCase().includes(q) ||
          item.rationale?.toLowerCase().includes(q)
      );
    }

    if (sortOption === 'conf-desc') {
      items.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
    } else if (sortOption === 'conf-asc') {
      items.sort((a, b) => (a.confidence ?? 0) - (b.confidence ?? 0));
    } else if (sortOption === 'alpha') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    }

    return items;
  }, [slice, searchQuery, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const pagedItems = filteredItems.slice((activePage - 1) * pageSize, activePage * pageSize);

  if (!slice) return null;

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: colors.overlay.backdrop,
            backdropFilter: 'blur(3px)',
          }}
        />
        <RadixDialog.Content
          style={{
            position: 'fixed',
            inset: '0 0 0 auto',
            zIndex: 101,
            width: '100%',
            maxWidth: '620px',
            height: '100%',
            backgroundColor: colors.bg.surface,
            borderLeft: `1px solid ${colors.border.subtle}`,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: tokens.shadows.lg,
            boxSizing: 'border-box',
            outline: 'none',
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: tokens.spacing[4],
              borderBottom: `1px solid ${colors.border.subtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.bg.subtle,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: `2px ${tokens.spacing[2]}`,
                    borderRadius: tokens.radii.sm,
                    backgroundColor: colors.intent.primary.subtle,
                    color: colors.intent.primary.main,
                  }}
                >
                  OUTCOME SLICE
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: colors.text.muted,
                    fontFamily: 'monospace',
                  }}
                >
                  {slice.count.toLocaleString()} items
                </span>
              </div>
              <RadixDialog.Title asChild>
                <h3
                  style={{
                    margin: `${tokens.spacing[1]} 0 0 0`,
                    fontSize: '18px',
                    fontWeight: 700,
                    color: colors.text.primary,
                  }}
                >
                  {slice.title}
                </h3>
              </RadixDialog.Title>
            </div>

            <RadixDialog.Close asChild>
              <button
                type="button"
                aria-label="Close drawer"
                style={{
                  background: 'none',
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: tokens.radii.md,
                  color: colors.text.muted,
                  padding: tokens.spacing[2],
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                &#x2715;
              </button>
            </RadixDialog.Close>
          </div>

          {/* Filter / Search Bar */}
          <div
            style={{
              padding: tokens.spacing[3],
              borderBottom: `1px solid ${colors.border.subtle}`,
              display: 'flex',
              gap: tokens.spacing[2],
              backgroundColor: colors.bg.surface,
            }}
          >
            <input
              type="text"
              aria-label="Search sample items"
              placeholder="Search items, keywords, rationale..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                flex: 1,
                backgroundColor: colors.bg.canvas,
                border: `1px solid ${colors.border.default}`,
                borderRadius: tokens.radii.md,
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                color: colors.text.primary,
                fontSize: '13px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />

            <select
              aria-label="Sort sample items"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
              style={{
                backgroundColor: colors.bg.canvas,
                border: `1px solid ${colors.border.default}`,
                borderRadius: tokens.radii.md,
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                color: colors.text.primary,
                fontSize: '12px',
                fontFamily: 'sans-serif',
                outline: 'none',
              }}
            >
              <option value="conf-desc">Highest Confidence</option>
              <option value="conf-asc">Lowest Confidence</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>

          {/* Items List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: tokens.spacing[4],
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[2],
            }}
          >
            {pagedItems.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: `${tokens.spacing[10]} 0`,
                  color: colors.text.muted,
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              >
                {slice.items.length === 0 && !searchQuery.trim()
                  ? 'No sample items available'
                  : 'No items match the current search filter.'}
              </div>
            ) : (
              pagedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: colors.bg.canvas,
                    border: `1px solid ${item.isFlag ? colors.intent.danger.main : colors.border.subtle}`,
                    borderRadius: tokens.radii.lg,
                    padding: tokens.spacing[3],
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
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: colors.text.primary,
                        }}
                      >
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: colors.text.muted,
                            fontFamily: 'monospace',
                          }}
                        >
                          {item.subtitle}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          padding: `2px ${tokens.spacing[1]}`,
                          borderRadius: tokens.radii.sm,
                          backgroundColor: item.isFlag
                            ? colors.intent.danger.subtle
                            : colors.intent.success.subtle,
                          color: item.isFlag ? colors.intent.danger.main : colors.intent.success.main,
                        }}
                      >
                        {item.verdict}
                      </span>
                      {item.confidence !== undefined && (
                        <span
                          style={{
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: colors.intent.primary.main,
                          }}
                        >
                          {item.confidence}%
                        </span>
                      )}
                    </div>
                  </div>

                  {item.contentPreview && (
                    <div
                      style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: colors.text.primary,
                        backgroundColor: colors.bg.surface,
                        padding: tokens.spacing[2],
                        borderRadius: tokens.radii.md,
                        border: `1px solid ${colors.border.subtle}`,
                      }}
                    >
                      &ldquo;{item.contentPreview}&rdquo;
                    </div>
                  )}

                  {item.rationale && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: item.isFlag ? colors.intent.danger.main : colors.text.muted,
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      <span>&bull;</span>
                      <span>{item.rationale}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Drawer Pagination Footer */}
          <div
            style={{
              padding: tokens.spacing[3],
              borderTop: `1px solid ${colors.border.subtle}`,
              backgroundColor: colors.bg.subtle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: colors.text.muted,
            }}
          >
            <span>
              {filteredItems.length === 0
                ? '0 items'
                : `Showing ${(activePage - 1) * pageSize + 1}–${Math.min(
                    activePage * pageSize,
                    filteredItems.length
                  )} of ${filteredItems.length}`}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <button
                type="button"
                disabled={activePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  backgroundColor: colors.bg.surface,
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: tokens.radii.sm,
                  padding: `3px ${tokens.spacing[2]}`,
                  color: colors.text.primary,
                  cursor: activePage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: activePage <= 1 ? 0.4 : 1,
                }}
              >
                &larr; Prev
              </button>
              <span style={{ padding: `0 ${tokens.spacing[1]}` }}>
                {activePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={activePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  backgroundColor: colors.bg.surface,
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: tokens.radii.sm,
                  padding: `3px ${tokens.spacing[2]}`,
                  color: colors.text.primary,
                  cursor: activePage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: activePage >= totalPages ? 0.4 : 1,
                }}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
