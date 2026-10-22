// ТРЕБУЕТ vitest. В apps/web он пока не установлен, поэтому файл исключён
// из tsconfig (как и vitest.config.ts). Чтобы запустить:
//   pnpm --filter @synteco/web add -D vitest
//   pnpm --filter @synteco/web exec vitest run src/lib/security
// Логика функции проверена вручную: тег script разорвать нельзя, JSON остаётся
// валидным, данные не искажаются.

import { describe, it, expect } from 'vitest';
import { safeJsonLd } from './json-ld';

describe('safeJsonLd', () => {
  it('не даёт закрыть тег script названием товара (регрессия SEC)', () => {
    const data = { name: 'Подшипник</script><script>alert(1)</script>' };
    const out = safeJsonLd(data);
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('\\u003c');
  });

  it('остаётся корректным JSON после экранирования', () => {
    const data = { name: 'Труба <50мм> & фитинг', price: 1200 };
    const parsed = JSON.parse(safeJsonLd(data));
    expect(parsed.name).toBe('Труба <50мм> & фитинг');
    expect(parsed.price).toBe(1200);
  });

  it('экранирует разделители строк U+2028 и U+2029', () => {
    const out = safeJsonLd({ t: 'a b c' });
    expect(out).toContain('\\u2028');
    expect(out).toContain('\\u2029');
    expect(JSON.parse(out).t).toBe('a b c');
  });
});
