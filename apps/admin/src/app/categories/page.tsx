'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/api/admin';

interface CatNode { id: string; name: string; slug: string; level: number; productCount: number; parentId: string | null; children: CatNode[]; }

function buildTree(cats: any[]): CatNode[] {
  const map = new Map<string, CatNode>();
  const roots: CatNode[] = [];
  cats.forEach(c => map.set(c.id, { ...c, children: [] }));
  cats.forEach(c => {
    if (c.parentId && map.has(c.parentId)) map.get(c.parentId)!.children.push(map.get(c.id)!);
    else if (!c.parentId) roots.push(map.get(c.id)!);
  });
  return roots;
}

function Row({ node, depth }: { node: CatNode; depth: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasKids = node.children.length > 0;
  return (
    <div>
      <button
        type="button"
        onClick={() => hasKids && setOpen(!open)}
        disabled={!hasKids}
        aria-expanded={hasKids ? open : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: `calc(100% - ${depth * 24}px)`,
          marginLeft: depth * 24, padding: '10px 14px', cursor: hasKids ? 'pointer' : 'default',
          border: 0, borderBottom: '1px solid var(--border)', background: 'transparent',
          color: 'inherit', textAlign: 'left',
        }}
      >
        <span style={{ width: 16, fontSize: 12, color: 'var(--ink-4)' }}>{hasKids ? (open ? '▼' : '▶') : '·'}</span>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{node.name}</span>
        <span className="mono muted" style={{ fontSize: 11 }}>{node.slug}</span>
        <span className="pill" style={{ fontSize: 10 }}>Ур. {node.level}</span>
        <span className="num" style={{ fontSize: 13, fontWeight: 600, minWidth: 60, textAlign: 'right' }}>{node.productCount} SKU</span>
      </button>
      {open && node.children.map(c => <Row key={c.id} node={c} depth={depth + 1} />)}
    </div>
  );
}

export default function CategoriesPage() {
  const [cats, setCats] = useState<CatNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(cats => { setCats(buildTree(cats ?? [])); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const countAll = (arr: CatNode[]): number => arr.reduce((s, c) => s + 1 + countAll(c.children), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Категории</div><div className="page-sub">{countAll(cats)} категорий в иерархии</div></div>
      </div>
      {loading ? <div className="card" style={{ padding: 60, textAlign: 'center' }}><div className="skeleton" style={{ height: 200 }} /></div> : (
        <div className="card" style={{ padding: '12px 0' }}>
          {cats.map(c => <Row key={c.id} node={c} depth={0} />)}
          {cats.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Нет категорий</div>}
        </div>
      )}
    </div>
  );
}
