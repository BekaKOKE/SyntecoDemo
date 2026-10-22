'use client';
import React, { type ReactNode } from 'react';
import { Icons } from '@/lib/icons';

interface EmptyStateProps {
  /** Optional emoji string (legacy) — prefer passing an Icons.* node via iconNode */
  icon?: string;
  /** SVG icon node, e.g. <Icons.inbox />. Takes precedence over `icon`. */
  iconNode?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({ icon, iconNode, title, description, action, children }: EmptyStateProps) {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <div style={{ marginBottom: 4, color: 'var(--color-ink-4)', opacity: 0.7 }}>
        {iconNode ?? <Icons.inbox width={40} height={40} />}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>{title}</h3>
      {description && <p className="muted" style={{ fontSize: 14, maxWidth: 480, lineHeight: 1.55 }}>{description}</p>}
      {action && (
        action.href ? (
          <a href={action.href} className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
            {action.label}
          </a>
        ) : action.onClick ? (
          <button onClick={action.onClick} className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
            {action.label}
          </button>
        ) : null
      )}
      {children}
    </div>
  );
}
