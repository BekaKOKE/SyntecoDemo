import type { FC, SVGProps } from 'react';

interface PlaceholderScreenProps {
  title: string;
  sub: string;
  icon: FC<SVGProps<SVGSVGElement>>;
}

export function PlaceholderScreen({ title, sub, icon: Icon }: PlaceholderScreenProps) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{title}</div>
          <div className="page-sub">{sub}</div>
        </div>
      </div>
      <div className="card" style={{ padding: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: 'var(--red-light)', color: 'var(--red)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon style={{ width: 32, height: 32 }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginTop: 6 }}>Раздел в разработке</div>
        <div className="muted" style={{ fontSize: 13, maxWidth: 400, lineHeight: 1.5 }}>
          Этот модуль появится в одной из ближайших итераций. Если хотите ускорить — оставьте запрос отделу продукта.
        </div>
        <button className="btn btn-secondary" style={{ marginTop: 10 }}>Запросить раздел</button>
      </div>
    </div>
  );
}
