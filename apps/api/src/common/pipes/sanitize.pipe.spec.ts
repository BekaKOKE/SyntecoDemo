import { SanitizePipe } from './sanitize.pipe';
import type { ArgumentMetadata } from '@nestjs/common';

const META = {} as ArgumentMetadata;

describe('SanitizePipe', () => {
  const pipe = new SanitizePipe();

  it('вырезает теги скрипта', () => {
    expect(pipe.transform('<script>alert(1)</script>привет', META)).toBe('привет');
  });

  it('НЕ превращает HTML-сущности обратно в теги (регрессия SEC)', () => {
    // Раньше пайп сначала снимал теги, а потом декодировал сущности,
    // из-за чего эта строка выходила из него настоящим <script>.
    const payload = '&lt;script&gt;alert(1)&lt;/script&gt;';
    const result = pipe.transform(payload, META);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('</script>');
    expect(result).not.toMatch(/<[a-z]/i);
  });

  it('не собирает тег из сущностей внутри объекта', () => {
    const result: any = pipe.transform({ name: '&lt;img src=x onerror=alert(1)&gt;' }, META);
    expect(result.name).not.toContain('<img');
  });

  it('не портит обычный текст и числа', () => {
    expect(pipe.transform('Подшипник 6205 2RS', META)).toBe('Подшипник 6205 2RS');
    expect(pipe.transform(42, META)).toBe(42);
    expect(pipe.transform(null, META)).toBeNull();
  });

  it('обрезает пробелы по краям', () => {
    expect(pipe.transform('  текст  ', META)).toBe('текст');
  });
});
