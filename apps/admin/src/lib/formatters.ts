/** Format a number with space separators (Russian locale style) */
export function fmtTng(n: number): string {
  return n.toLocaleString('ru-RU').replace(/,/g, ' ');
}

/** Format as KZT — number with space separators + ₸ */
export function fmtKZT(n: number): string {
  return fmtTng(n) + ' ₸';
}
