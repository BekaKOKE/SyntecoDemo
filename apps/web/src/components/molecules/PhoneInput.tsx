'use client';

import { useState, useEffect, useRef, type InputHTMLAttributes } from 'react';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value?: string;
  onChange?: (formatted: string) => void;
}

function format(raw: string): string {
  // Only keep digits
  let d = raw.replace(/\D/g, '');
  // Remove leading country code digits (7 or 8) — we always prefix +7
  if (d.startsWith('7')) d = d.slice(1);
  else if (d.startsWith('8')) d = d.slice(1);

  if (d.length === 0) return '+7 (';
  if (d.length <= 3) return `+7 (${d}`;
  if (d.length <= 6) return `+7 (${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length <= 8) return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}`;
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

/**
 * Phone input with KZ mask: +7 (XXX) XXX XX XX
 *
 * value prop is the raw phone string (e.g. "+77011234567").
 * onChange returns the formatted display string (e.g. "+7 (701) 123 45 67").
 */
export function PhoneInput({ value, onChange, className, style, placeholder, required, pattern, ...rest }: PhoneInputProps) {
  const [display, setDisplay] = useState('');
  const isEditing = useRef(false);

  // Sync from parent value (e.g. auto-fill from profile).
  // Uncontrolled usage (no `value` prop) keeps its own state — syncing there
  // would wipe what the user typed on every re-render.
  useEffect(() => {
    if (value === undefined) return;
    if (!isEditing.current) {
      setDisplay(value ? format(value) : '');
    }
  }, [value]);

  function handleChange(rawValue: string) {
    // Let user type freely — just clean non-digits and re-format
    const cleaned = rawValue.replace(/[^\d+()\s-]/g, '');
    if (!cleaned.startsWith('+7')) {
      // User deleted +7 — reset to just +7
      setDisplay('+7 (');
      onChange?.('+7 (');
      return;
    }
    const formatted = format(cleaned);
    setDisplay(formatted);
    onChange?.(formatted);
  }

  function handleFocus() {
    isEditing.current = true;
    // Seed the "+7 (" prefix before the first keystroke. Without it `format`
    // reads a leading 7 as the country code and swallows it — KZ mobile codes
    // (700–708, 747, 771–778…) all start with 7, so "7011234567" would come
    // out as "+7 (011) 234 56 7".
    setDisplay(d => d || '+7 (');
  }

  function handleBlur() {
    isEditing.current = false;
    // Re-format on blur to clean up partial input. Only for controlled usage —
    // otherwise this would clear a field the parent isn't tracking.
    if (value !== undefined) { setDisplay(value ? format(value) : ''); return; }
    // Nothing typed beyond the seeded prefix — clear it so the placeholder
    // shows again and `required` still triggers.
    setDisplay(d => (d === '+7 (' ? '' : d));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Prevent Backspace from deleting +7 prefix
    if (e.key === 'Backspace') {
      const pos = (e.target as HTMLInputElement).selectionStart || 0;
      if (pos <= 3) {
        e.preventDefault();
      }
    }
  }

  return (
    <input
      type="tel"
      inputMode="numeric"
      className={className || 'input'}
      style={style}
      placeholder={placeholder || '+7 (___) ___ __ __'}
      required={required}
      pattern={pattern || (required ? String.raw`\+7 \(\d{3}\) \d{3} \d{2} \d{2}` : undefined)}
      value={display}
      onChange={e => handleChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  );
}
