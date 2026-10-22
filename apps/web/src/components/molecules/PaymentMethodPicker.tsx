'use client';

import { PhoneInput } from '@/components/molecules/PhoneInput';
import { Icons } from '@/lib/icons';
import type { PaymentMethod, PaymentMethodCode } from '@/lib/api/orders';

const METHOD_ICONS: Record<PaymentMethodCode, (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  kaspi: Icons.phone,
  halyk_card: Icons.money,
  bank_invoice: Icons.docText,
  cash_on_delivery: Icons.truck,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--color-hair-strong)', borderRadius: 'var(--radius-sm)',
  fontSize: 14, fontFamily: 'var(--font-sans)', background: 'var(--color-surface)',
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 };

const digits = (v: string) => v.replace(/\D/g, '');

function formatCardNumber(v: string) {
  return digits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(v: string) {
  const d = digits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

/** Client-side pre-check; the gateway adapter does the authoritative validation. */
export function validatePaymentDetails(method: PaymentMethodCode, details: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (method === 'kaspi') {
    if (digits(details.phone ?? '').length !== 11) errors.phone = 'Укажите номер телефона, привязанный к Kaspi';
  }
  if (method === 'halyk_card') {
    const pan = digits(details.cardNumber ?? '');
    if (pan.length !== 16) errors.cardNumber = 'Номер карты — 16 цифр';
    const m = (details.cardExpiry ?? '').match(/^(\d{2})\/(\d{2})$/);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) errors.cardExpiry = 'Формат ММ/ГГ';
    if (!/^\d{3}$/.test(details.cardCvc ?? '')) errors.cardCvc = '3 цифры';
    if ((details.cardHolder ?? '').trim().length < 2) errors.cardHolder = 'Имя как на карте';
  }
  return errors;
}

/** Only the fields the chosen method needs go to the API. */
export function pickPaymentDetails(method: PaymentMethod | undefined, details: Record<string, string>) {
  if (!method || method.requiredFields.length === 0) return undefined;
  return Object.fromEntries(method.requiredFields.map(f => [f, (details[f] ?? '').trim()]));
}

function FieldError({ text }: { text?: string }) {
  if (!text) return null;
  return <div style={{ color: 'var(--color-accent)', fontSize: 12, marginTop: 4 }}>{text}</div>;
}

export function PaymentMethodPicker({
  methods,
  value,
  onChange,
  details,
  onDetailsChange,
  errors = {},
  name = 'payment-method',
}: {
  methods: PaymentMethod[];
  value: PaymentMethodCode;
  onChange: (method: PaymentMethodCode) => void;
  details: Record<string, string>;
  onDetailsChange: (details: Record<string, string>) => void;
  errors?: Record<string, string>;
  name?: string;
}) {
  const set = (key: string, v: string) => onDetailsChange({ ...details, [key]: v });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {methods.map(m => {
        const active = m.method === value;
        const Icon = METHOD_ICONS[m.method] ?? Icons.money;
        return (
          <div
            key={m.method}
            style={{
              border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-hair)'}`,
              borderRadius: 'var(--radius-md)',
              background: active ? 'var(--color-accent-soft)' : 'var(--color-surface)',
              transition: 'border-color .15s, background .15s',
            }}
          >
            <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', cursor: 'pointer' }}>
              <input type="radio" name={name} checked={active} onChange={() => onChange(m.method)} style={{ marginTop: 3, accentColor: 'var(--color-accent)' }} />
              <span style={{ color: active ? 'var(--color-accent)' : 'var(--color-ink-3)', marginTop: 1 }}><Icon width={18} height={18} /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{m.displayName}</span>
                <span className="muted" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{m.description}</span>
              </span>
            </label>

            {active && m.method === 'kaspi' && (
              <div style={{ padding: '0 14px 14px 44px' }}>
                <label style={labelStyle}>Телефон Kaspi *</label>
                <PhoneInput value={details.phone ?? ''} onChange={v => set('phone', v)} style={inputStyle} />
                <FieldError text={errors.phone} />
                <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>Счёт придёт в приложение Kaspi.kz</div>
              </div>
            )}

            {active && m.method === 'halyk_card' && (
              <div style={{ padding: '0 14px 14px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Номер карты *</label>
                  <input value={details.cardNumber ?? ''} onChange={e => set('cardNumber', formatCardNumber(e.target.value))}
                    inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" className="mono" style={inputStyle} />
                  <FieldError text={errors.cardNumber} />
                </div>
                <div>
                  <label style={labelStyle}>Срок действия *</label>
                  <input value={details.cardExpiry ?? ''} onChange={e => set('cardExpiry', formatExpiry(e.target.value))}
                    inputMode="numeric" autoComplete="cc-exp" placeholder="ММ/ГГ" className="mono" style={inputStyle} />
                  <FieldError text={errors.cardExpiry} />
                </div>
                <div>
                  <label style={labelStyle}>CVC *</label>
                  <input value={details.cardCvc ?? ''} onChange={e => set('cardCvc', digits(e.target.value).slice(0, 3))}
                    inputMode="numeric" autoComplete="cc-csc" type="password" placeholder="•••" className="mono" style={inputStyle} />
                  <FieldError text={errors.cardCvc} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Владелец карты *</label>
                  <input value={details.cardHolder ?? ''} onChange={e => set('cardHolder', e.target.value.toUpperCase())}
                    autoComplete="cc-name" placeholder="IVAN IVANOV" style={inputStyle} />
                  <FieldError text={errors.cardHolder} />
                </div>
                <div className="muted" style={{ gridColumn: '1 / -1', fontSize: 11, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Icons.lock width={12} height={12} /> Данные карты передаются в процессинг Halyk ePay и не сохраняются
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DemoPaymentHint() {
  return (
    <div style={{ padding: '12px 14px', border: '1px dashed var(--color-info)', background: 'var(--color-info-soft)', borderRadius: 'var(--radius-sm)', fontSize: 12, lineHeight: 1.6 }}>
      <div style={{ fontWeight: 700, color: 'var(--color-info)', marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
        <Icons.warning width={13} height={13} /> Демо-режим: тестовые данные
      </div>
      <div><b>Карта:</b> <span className="mono">4400 4300 0000 0007</span> — успешно; <span className="mono">4000 0000 0000 0002</span> — недостаточно средств; прошедший срок — отказ. CVC 123, любой будущий ММ/ГГ.</div>
      <div><b>Kaspi:</b> номер на <span className="mono">…0000</span> — отказ, на <span className="mono">…9999</span> — сервис недоступен, любой другой — оплачено.</div>
      <div><b>Промокоды:</b> <span className="mono">SAFETY10</span>, <span className="mono">MINUS5000</span>, <span className="mono">OPT2026</span>, <span className="mono">BUY3GET1</span>, <span className="mono">EXPIRED2025</span> (истёк).</div>
    </div>
  );
}
