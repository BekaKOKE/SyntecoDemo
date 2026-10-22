import { Controller, Get, Header } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import type { UserRole } from '@prisma/client';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  // Метрики содержат бизнес-показатели (число заказов и заявок).
  // Раньше эндпоинт был @Public() и отдавался всему интернету.
  // Теперь: только администратор, плюс отдельно закрыт на nginx.
  @Roles('admin' as UserRole, 'super_admin' as UserRole)
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  getMetrics(): string {
    const lines: string[] = [
      '# HELP synteco_http_requests_total Total HTTP requests',
      '# TYPE synteco_http_requests_total counter',
      `synteco_http_requests_total ${this.metrics.get('http_requests_total')}`,
      '',
      '# HELP synteco_http_requests_by_status HTTP requests by status class',
      '# TYPE synteco_http_requests_by_status counter',
      `synteco_http_requests_by_status{class="2xx"} ${this.metrics.get('http_requests_2xx')}`,
      `synteco_http_requests_by_status{class="4xx"} ${this.metrics.get('http_requests_4xx')}`,
      `synteco_http_requests_by_status{class="5xx"} ${this.metrics.get('http_requests_5xx')}`,
      '',
      '# HELP synteco_orders_created_total Total orders created',
      '# TYPE synteco_orders_created_total counter',
      `synteco_orders_created_total ${this.metrics.get('orders_created')}`,
      '',
      '# HELP synteco_inquiries_created_total Total inquiries created',
      '# TYPE synteco_inquiries_created_total counter',
      `synteco_inquiries_created_total ${this.metrics.get('inquiries_created')}`,
      '',
      '# HELP synteco_process_uptime_seconds Process uptime',
      '# TYPE synteco_process_uptime_seconds gauge',
      `synteco_process_uptime_seconds ${process.uptime().toFixed(2)}`,
      '',
      '# HELP synteco_process_memory_bytes Process memory',
      '# TYPE synteco_process_memory_bytes gauge',
      `synteco_process_memory_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}`,
      `synteco_process_memory_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}`,
      `synteco_process_memory_bytes{type="rss"} ${process.memoryUsage().rss}`,
    ];
    return lines.join('\n') + '\n';
  }
}
