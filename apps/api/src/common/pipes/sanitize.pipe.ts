import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * Sanitizes string inputs by stripping HTML tags and trimming whitespace.
 * Applied globally in main.ts via ValidationPipe + custom transformer.
 * Explicitly does NOT sanitize JSON/object fields — those should be validated
 * by their respective DTOs with proper schema validation.
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  /** Simple HTML tag strip — removes <script>, <iframe>, <img>, <style>, etc. */
  private stripHtml(value: string): string {
    return value
      // Remove script and style blocks entirely
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      .trim();

    // ВАЖНО: здесь НЕ декодируются HTML-сущности.
    // Раньше после снятия тегов выполнялось обратное преобразование
    // (&lt; -> <, &gt; -> > и т.д.). Из-за этого строка вида
    //   &lt;script&gt;alert(1)&lt;/script&gt;
    // проходила фильтр нетронутой (тегов в ней нет), а на выходе
    // превращалась в настоящий <script> и в таком виде сохранялась в БД.
    // То есть пайп не защищал, а собирал полезную нагрузку за атакующего.
    // Декодирование удалено намеренно — не возвращать.
  }

  transform(value: any, _metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return this.stripHtml(value);
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = typeof val === 'string' ? this.stripHtml(val) : val;
      }
      return sanitized;
    }

    return value;
  }
}
