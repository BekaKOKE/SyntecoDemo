import { Injectable } from '@nestjs/common';

/**
 * In-memory metrics counter. Tracks request counts and business metrics.
 * Exposed via MetricsController at GET /metrics in Prometheus format.
 */
@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, number>();

  constructor() {
    this.counters.set('http_requests_total', 0);
    this.counters.set('http_requests_2xx', 0);
    this.counters.set('http_requests_4xx', 0);
    this.counters.set('http_requests_5xx', 0);
    this.counters.set('orders_created', 0);
    this.counters.set('inquiries_created', 0);
  }

  increment(key: string) {
    const current = this.counters.get(key) ?? 0;
    this.counters.set(key, current + 1);
  }

  get(key: string): number {
    return this.counters.get(key) ?? 0;
  }

  getAll(): Map<string, number> {
    return new Map(this.counters);
  }
}
