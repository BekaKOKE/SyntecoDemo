import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { InquiryQueryDto } from './dto/inquiry-query.dto';
import { MailerService } from '@/common/mailer/mailer.service';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly mailer: MailerService,
  ) {}

  // ── Generate next inquiry number ──────────────────────────────────
  private async nextInquiryNumber(): Promise<string> {
    const last = await this.prisma.inquiry.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { inquiryNumber: true },
    });

    if (!last?.inquiryNumber) {
      return 'RQ-26-00001';
    }

    const seq = parseInt(last.inquiryNumber.split('-').pop()!, 10) + 1;
    return `RQ-26-${String(seq).padStart(5, '0')}`;
  }

  // ── Create ─────────────────────────────────────────────────────────
  async create(dto: CreateInquiryDto) {
    const inquiryNumber = await this.nextInquiryNumber();
    const items = (dto.items ?? []).map((i) => ({
      sku: i.sku,
      name: i.name,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    }));
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    // SLA: 15 minutes for high priority, 60 for normal, 240 for low
    const slaMinutes = dto.priority === 'high' ? 15 : dto.priority === 'low' ? 240 : 60;
    const slaDueBy = new Date(Date.now() + slaMinutes * 60_000);

    const inquiry = await this.prisma.inquiry.create({
      data: {
        inquiryNumber,
        companyName: dto.companyName,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        items: items as any,
        itemCount,
        totalAmount,
        priority: (dto.priority as any) ?? 'normal',
        notes: dto.notes,
        slaDueBy,
      },
    });

    // Notify sales by email (non-blocking — failure must not affect creation)
    this.sendInquiryNotification(inquiry).catch((err) => {
      this.logger.error(`Inquiry ${inquiry.inquiryNumber}: email notification failed: ${err?.message ?? err}`);
    });

    return inquiry;
  }

  // ── Email notification for a newly created inquiry ────────────────
  private async sendInquiryNotification(inquiry: any): Promise<void> {
    if (!this.mailer.isEnabled) return;

    const total = Number(inquiry.totalAmount);
    const totalStr = total.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const createdAtParts = new Intl.DateTimeFormat('ru-RU', {
      timeZone: 'Asia/Almaty',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(inquiry.createdAt));
    const datePart = (type: Intl.DateTimeFormatPartTypes) => createdAtParts.find((part) => part.type === type)?.value ?? '';
    const createdAtKz = `${datePart('day')}.${datePart('month')}.${datePart('year')} ${datePart('hour')}:${datePart('minute')}`;

    const itemsList = Array.isArray(inquiry.items) && inquiry.items.length > 0
      ? inquiry.items.map((i: any, idx: number) =>
          `${idx + 1}. ${i.name}\n    Артикул: ${i.sku}   Кол-во: ${i.quantity} шт   Цена: ${Number(i.unitPrice).toLocaleString('ru-RU')} ₸`
        ).join('\n')
      : '— (без позиций, общий запрос)';

    const text = [
      `Новая заявка с сайта Synteco`,
      ``,
      `Номер: ${inquiry.inquiryNumber}`,
      `Создана: ${createdAtKz} (время Казахстана)`,
      ``,
      `── Клиент ──`,
      `Компания: ${inquiry.companyName}`,
      `Контакт: ${inquiry.contactName}`,
      inquiry.contactPhone ? `Телефон: ${inquiry.contactPhone}` : '',
      inquiry.contactEmail ? `Email: ${inquiry.contactEmail}` : '',
      inquiry.notes ? `\n── Комментарий ──\n${inquiry.notes}` : '',
      ``,
      `── Позиции (${inquiry.itemCount} шт) ──`,
      itemsList,
      ``,
      total > 0 ? `Итого: ${totalStr} ₸` : ``,
    ].filter(Boolean).join('\n');

    const subject = inquiry.itemCount > 0
      ? `📩 Заявка ${inquiry.inquiryNumber} — ${inquiry.companyName} (${totalStr} ₸)`
      : `📩 Заявка ${inquiry.inquiryNumber} — ${inquiry.companyName}`;

    await this.mailer.send({
      to: this.mailer.inquiryTo,
      subject,
      text,
    });
  }

  // ── Find all (with filters + pagination) ──────────────────────────
  async findAll(query: InquiryQueryDto) {
    const { status, priority, search, page = 1, limit = 20 } = query;
    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { inquiryNumber: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { contactPhone: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── Find by user email (for "My Inquiries" page) ─────────────
  async findByEmail(email: string) {
    const data = await this.prisma.inquiry.findMany({
      where: { contactEmail: email },
      orderBy: { createdAt: 'desc' },
    });
    return { data, meta: { total: data.length } };
  }

  // ── Find by ID ────────────────────────────────────────────────────
  async findOne(id: string) {
    return this.prisma.inquiry.findUniqueOrThrow({ where: { id } });
  }

  // ── Update ────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateInquiryDto) {
    const data: any = { ...dto };

    // Recalculate items if provided
    if (dto.items) {
      const items = dto.items.map((i) => ({
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      }));
      data.items = items;
      data.itemCount = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
      data.totalAmount = items.reduce((sum: number, i: any) => sum + i.quantity * i.unitPrice, 0);
    }

    return this.prisma.inquiry.update({ where: { id }, data });
  }

  // ── Delete ────────────────────────────────────────────────────────
  async remove(id: string) {
    return this.prisma.inquiry.delete({ where: { id } });
  }

  // ── KPI stats ─────────────────────────────────────────────────────
  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60_000);

    const [
      total,
      active,
      todayCreated,
      yesterdayCreated,
      avgResponseResult,
      conversionResult,
      avgCheckResult,
    ] = await Promise.all([
      // Total inquiries
      this.prisma.inquiry.count(),
      // Active (not closed/cancelled)
      this.prisma.inquiry.count({
        where: { status: { notIn: ['closed', 'cancelled'] } },
      }),
      // Created today
      this.prisma.inquiry.count({
        where: { createdAt: { gte: todayStart } },
      }),
      // Created yesterday
      this.prisma.inquiry.count({
        where: {
          createdAt: { gte: yesterdayStart, lt: todayStart },
        },
      }),
      // Average response: time from created to first status change (in_progress/quoted)
      this.prisma.$queryRawUnsafe<Array<{ avg_minutes: number }>>(
        `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60), 0)::float as avg_minutes
         FROM crm.inquiries
         WHERE status IN ('in_progress', 'quoted', 'closed')
           AND updated_at > created_at`
      ),
      // Conversion to deal (quoted or closed)
      this.prisma.$queryRawUnsafe<Array<{ rate: number }>>(
        `SELECT CASE WHEN COUNT(*) = 0 THEN 0
          ELSE (COUNT(*) FILTER (WHERE status IN ('quoted', 'closed'))::float / COUNT(*)::float * 100)::float
        END as rate FROM crm.inquiries`
      ),
      // Average check
      this.prisma.$queryRawUnsafe<Array<{ avg_amount: number }>>(
        `SELECT COALESCE(AVG(total_amount), 0)::float as avg_amount
         FROM crm.inquiries
         WHERE item_count > 0`
      ),
    ]);

    return {
      total,
      active,
      todayCreated,
      yesterdayCreated,
      todayDelta: todayCreated - yesterdayCreated,
      avgResponseTime: Math.round(avgResponseResult?.[0]?.avg_minutes ?? 0),
      conversionRate: Math.round(conversionResult?.[0]?.rate ?? 0),
      avgCheck: Math.round(avgCheckResult?.[0]?.avg_amount ?? 0),
    };
  }
}
