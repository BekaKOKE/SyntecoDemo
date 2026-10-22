'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/lib/icons';
import { CATEGORY_OPTIONS, INDUSTRY_OPTIONS, CONDITION_OPTIONS } from '@/lib/advisor';

const STEPS = [
  { label: 'Что нужно?', param: 'categorySlug', options: CATEGORY_OPTIONS },
  { label: 'Отрасль?', param: 'industry', options: INDUSTRY_OPTIONS },
  { label: 'Особые условия?', param: 'condition', options: CONDITION_OPTIONS },
];

export function ProductAdvisor() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const params = new URLSearchParams();
    Object.entries(selections).forEach(([k, v]) => {
      if (v && v !== 'any') params.set(k, v);
    });
    const qs = params.toString();
    router.push(`/podbor${qs ? `?${qs}` : ''}`);
  };

  return (
    <section id="advisor" style={{ scrollMarginTop: 80, background: 'var(--color-surface)', borderTop: '1px solid var(--color-hair)', borderBottom: '1px solid var(--color-hair)', padding: '56px 0' }}>
      <div className="container-site">
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="eyebrow">03 · Подбор товара</div>
          <h2 style={{ marginTop: 8, fontSize: 28 }}>Не знаете артикул? Подберём за 3 вопроса</h2>
          <p className="muted" style={{ marginTop: 10, fontSize: 14 }}>Сначала покажем бренды, с которыми мы работаем официально, затем подходящие товары.</p>

          <div style={{ display: 'flex', gap: 0, marginTop: 32, background: 'var(--color-surface-2)', borderRadius: 12, overflow: 'hidden' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '12px 16px', textAlign: 'center', background: i === step ? 'var(--color-accent)' : 'transparent', color: i === step ? '#fff' : 'var(--color-ink-3)', fontSize: 12, fontWeight: i === step ? 600 : 400, transition: 'background .2s' }}>
                {i + 1}. {s.label}
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 16, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-ink-2)' }}>
              {STEPS[step]?.label}
            </div>
            <select
              value={selections[STEPS[step]!.param] ?? ''}
              onChange={(e) => setSelections((prev) => ({ ...prev, [STEPS[step]!.param]: e.target.value }))}
              style={{ width: '100%', height: 44, padding: '0 14px', border: '1px solid var(--color-hair-strong)', borderRadius: 'var(--radius-md)', fontSize: 15, fontFamily: 'var(--font-sans)', background: 'var(--color-surface)', outline: 'none' }}
            >
              {STEPS[step]!.options.map((o) => (
                <option key={o.value} value={o.value} disabled={o.value === ''}>{o.label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="btn btn-secondary">Назад</button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(step + 1)} disabled={!selections[STEPS[step]!.param]} className="btn btn-primary">
                  Далее <Icons.arrow />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={!selections[STEPS[step]!.param]} className="btn btn-primary btn-lg">
                  Показать подходящие товары <Icons.arrow />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
