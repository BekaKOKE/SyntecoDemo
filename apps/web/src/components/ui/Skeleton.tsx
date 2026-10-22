'use client';
import React from 'react';

/** Pulse animation skeleton placeholder */
function pulse(): React.CSSProperties {
  return {
    background: 'var(--color-surface-2)',
    borderRadius: 'var(--radius-sm)',
    animation: 'pulse 1.5s ease-in-out infinite',
    display: 'block',
  };
}

export function SkeletonText({ width = '100%', height = 16 }: { width?: number | string; height?: number }) {
  return <span style={{ ...pulse(), width, height, display: 'inline-block' }} />;
}

export function SkeletonCard({ aspectRatio = '1' }: { aspectRatio?: string }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ aspectRatio, background: 'var(--color-surface-2)' }} />
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonText width="60%" height={12} />
        <SkeletonText width="90%" height={14} />
        <SkeletonText width="40%" height={16} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 120px', gap: 24, padding: '12px 0', borderBottom: i < rows - 1 ? '1px solid var(--color-hair)' : 'none' }}>
            <div style={{ aspectRatio: '1', ...pulse() }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SkeletonText width="40%" height={12} />
              <SkeletonText width="80%" height={14} />
              <SkeletonText width="30%" height={11} />
            </div>
            <SkeletonText width="60%" height={12} />
            <SkeletonText width="80%" height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export const skeleton_keyframes = `
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;
