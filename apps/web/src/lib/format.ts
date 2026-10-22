/** 12345 → «12 345 ₸» */
export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return `${Math.round(Number.isFinite(n) ? n : 0).toLocaleString('ru-RU')} ₸`;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
