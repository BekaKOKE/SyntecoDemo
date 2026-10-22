import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { InquiriesService } from './inquiries.service';
import { MailerService } from '@/common/mailer/mailer.service';

describe('InquiriesService', () => {
  let service: InquiriesService;
  let prisma: any;
  const now = new Date('2026-06-09T12:00:00Z');

  beforeEach(async () => {
    prisma = {
      inquiry: {
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $queryRawUnsafe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiriesService,
        { provide: PrismaClient, useValue: prisma },
        { provide: MailerService, useValue: { isEnabled: false, inquiryTo: 'sales@example.com', send: jest.fn() } },
      ],
    }).compile();

    service = module.get<InquiriesService>(InquiriesService);
  });

  // ── create ───────────────────────────────────────────
  describe('create', () => {
    it('should create an inquiry with auto-generated number', async () => {
      prisma.inquiry.findFirst.mockResolvedValue(null);
      prisma.inquiry.create.mockResolvedValue({
        id: 'inq-1', inquiryNumber: 'RQ-26-00001', companyName: 'TestCo',
        contactName: 'John', contactPhone: '+7701', contactEmail: 'j@t.co',
        items: [], itemCount: 0, totalAmount: 0,
        status: 'new', priority: 'normal', notes: null, slaDueBy: now, createdAt: now, updatedAt: now,
      });

      const dto = { companyName: 'TestCo', contactName: 'John', contactPhone: '+7701' };
      const result = await service.create(dto);

      expect(result.inquiryNumber).toBe('RQ-26-00001');
      expect(result.companyName).toBe('TestCo');
    });

    it('should calculate itemCount and totalAmount from items', async () => {
      prisma.inquiry.findFirst.mockResolvedValue(null);
      prisma.inquiry.create.mockResolvedValue({
        id: 'inq-1', inquiryNumber: 'RQ-26-00001', companyName: 'C',
        contactName: 'N', contactPhone: null, contactEmail: null,
        items: [], itemCount: 15, totalAmount: 25000,
        status: 'new', priority: 'normal', notes: null, slaDueBy: now, createdAt: now, updatedAt: now,
      });

      const dto = {
        companyName: 'C', contactName: 'N',
        items: [
          { sku: 'A', name: 'Item A', quantity: 10, unitPrice: 1000 },
          { sku: 'B', name: 'Item B', quantity: 5, unitPrice: 3000 },
        ],
      };
      await service.create(dto);

      const call = prisma.inquiry.create.mock.calls[0][0];
      expect(call.data.itemCount).toBe(15);
      expect(call.data.totalAmount).toBe(25000); // 10*1000 + 5*3000
    });

    it('should set SLA based on priority', async () => {
      prisma.inquiry.findFirst.mockResolvedValue(null);
      prisma.inquiry.create.mockResolvedValue({
        id: 'inq-1', inquiryNumber: 'RQ-001', companyName: 'C',
        contactName: 'N', contactPhone: null, contactEmail: null,
        items: [], itemCount: 0, totalAmount: 0,
        status: 'new', priority: 'high', notes: null, slaDueBy: now, createdAt: now, updatedAt: now,
      });

      const highPriority = { companyName: 'C', contactName: 'N', priority: 'high' as const };
      await service.create(highPriority);
      let call = prisma.inquiry.create.mock.calls[0][0];
      expect(call.data.priority).toBe('high');
      // SLA should be 15 minutes from now
      const slaHigh = new Date(call.data.slaDueBy);
      expect(slaHigh.getTime() - Date.now()).toBeLessThan(16 * 60 * 1000);

      prisma.inquiry.create.mockClear();
      prisma.inquiry.findFirst.mockResolvedValue(null);
      const lowPriority = { companyName: 'C2', contactName: 'N2', priority: 'low' as const };
      await service.create(lowPriority);
      call = prisma.inquiry.create.mock.calls[0][0];
      const slaLow = new Date(call.data.slaDueBy);
      expect(slaLow.getTime() - Date.now()).toBeLessThan(241 * 60 * 1000);
    });

    it('should default to normal priority', async () => {
      prisma.inquiry.findFirst.mockResolvedValue(null);
      prisma.inquiry.create.mockResolvedValue({
        id: 'inq-1', inquiryNumber: 'RQ-001', companyName: 'C',
        contactName: 'N', contactPhone: null, contactEmail: null,
        items: [], itemCount: 0, totalAmount: 0,
        status: 'new', priority: 'normal', notes: null, slaDueBy: now, createdAt: now, updatedAt: now,
      });

      const dto = { companyName: 'C', contactName: 'N' };
      await service.create(dto);
      const call = prisma.inquiry.create.mock.calls[0][0];
      expect(call.data.priority).toBe('normal');
    });

    it('should generate sequential inquiry numbers', async () => {
      prisma.inquiry.findFirst.mockResolvedValue({ inquiryNumber: 'RQ-26-00150' });
      prisma.inquiry.create.mockResolvedValue({
        id: 'inq-1', inquiryNumber: 'RQ-26-00151', companyName: 'C',
        contactName: 'N', contactPhone: null, contactEmail: null,
        items: [], itemCount: 0, totalAmount: 0,
        status: 'new', priority: 'normal', notes: null, slaDueBy: now, createdAt: now, updatedAt: now,
      });

      const result = await service.create({ companyName: 'C', contactName: 'N' });
      expect(result.inquiryNumber).toBe('RQ-26-00151');
    });
  });

  // ── findAll ──────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated inquiries', async () => {
      prisma.inquiry.findMany.mockResolvedValue([
        { id: 'inq-1', inquiryNumber: 'RQ-001', companyName: 'A' },
        { id: 'inq-2', inquiryNumber: 'RQ-002', companyName: 'B' },
      ]);
      prisma.inquiry.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.inquiry.findMany.mockResolvedValue([]);
      prisma.inquiry.count.mockResolvedValue(0);

      await service.findAll({ status: 'new' });
      expect(prisma.inquiry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'new' } })
      );
    });

    it('should filter by priority', async () => {
      prisma.inquiry.findMany.mockResolvedValue([]);
      prisma.inquiry.count.mockResolvedValue(0);

      await service.findAll({ priority: 'high' });
      expect(prisma.inquiry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { priority: 'high' } })
      );
    });

    it('should search across multiple fields', async () => {
      prisma.inquiry.findMany.mockResolvedValue([]);
      prisma.inquiry.count.mockResolvedValue(0);

      await service.findAll({ search: 'testco' });
      const call = prisma.inquiry.findMany.mock.calls[0][0];
      expect(call.where.OR).toHaveLength(5);
      expect(call.where.OR[0]).toEqual({ inquiryNumber: { contains: 'testco', mode: 'insensitive' } });
      expect(call.where.OR).toEqual(expect.arrayContaining([
        { contactPhone: { contains: 'testco', mode: 'insensitive' } },
        { contactEmail: { contains: 'testco', mode: 'insensitive' } },
      ]));
    });
  });

  // ── findOne ──────────────────────────────────────────
  describe('findOne', () => {
    it('should return inquiry by ID', async () => {
      prisma.inquiry.findUniqueOrThrow.mockResolvedValue({ id: 'inq-1', inquiryNumber: 'RQ-001' });
      const result = await service.findOne('inq-1');
      expect(result.id).toBe('inq-1');
    });

    it('should throw when not found', async () => {
      prisma.inquiry.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));
      await expect(service.findOne('bad-id')).rejects.toThrow();
    });
  });

  // ── update ───────────────────────────────────────────
  describe('update', () => {
    it('should update inquiry fields', async () => {
      prisma.inquiry.update.mockResolvedValue({ id: 'inq-1', status: 'in_progress' });
      const result = await service.update('inq-1', { status: 'in_progress', notes: 'Updated' });
      expect(prisma.inquiry.update).toHaveBeenCalledWith({
        where: { id: 'inq-1' },
        data: { status: 'in_progress', notes: 'Updated' },
      });
    });

    it('should recalculate itemCount and totalAmount when items provided', async () => {
      prisma.inquiry.update.mockResolvedValue({});
      await service.update('inq-1', {
        items: [
          { sku: 'A', name: 'Item A', quantity: 3, unitPrice: 500 },
        ],
      });
      const call = prisma.inquiry.update.mock.calls[0][0];
      expect(call.data.itemCount).toBe(3);
      expect(call.data.totalAmount).toBe(1500);
    });
  });

  // ── remove ───────────────────────────────────────────
  describe('remove', () => {
    it('should delete inquiry', async () => {
      prisma.inquiry.delete.mockResolvedValue({});
      await service.remove('inq-1');
      expect(prisma.inquiry.delete).toHaveBeenCalledWith({ where: { id: 'inq-1' } });
    });
  });

  // ── getStats ─────────────────────────────────────────
  describe('getStats', () => {
    it('should return inquiry KPIs', async () => {
      prisma.inquiry.count
        .mockResolvedValueOnce(150) // total
        .mockResolvedValueOnce(42) // active
        .mockResolvedValueOnce(5) // todayCreated
        .mockResolvedValueOnce(3); // yesterdayCreated

      prisma.$queryRawUnsafe
        .mockResolvedValueOnce([{ avg_minutes: 45.5 }]) // avgResponseTime
        .mockResolvedValueOnce([{ rate: 35.2 }]) // conversionRate
        .mockResolvedValueOnce([{ avg_amount: 45000.5 }]); // avgCheck

      const stats = await service.getStats();
      expect(stats.total).toBe(150);
      expect(stats.active).toBe(42);
      expect(stats.todayCreated).toBe(5);
      expect(stats.yesterdayCreated).toBe(3);
      expect(stats.todayDelta).toBe(2); // 5 - 3
      expect(stats.avgResponseTime).toBe(46); // rounded
      expect(stats.conversionRate).toBe(35); // rounded
      expect(stats.avgCheck).toBe(45001); // rounded
    });

    it('should handle zero values gracefully', async () => {
      prisma.inquiry.count.mockResolvedValue(0);
      prisma.$queryRawUnsafe
        .mockResolvedValueOnce([{ avg_minutes: 0 }])
        .mockResolvedValueOnce([{ rate: 0 }])
        .mockResolvedValueOnce([{ avg_amount: 0 }]);

      const stats = await service.getStats();
      expect(stats.total).toBe(0);
      expect(stats.avgResponseTime).toBe(0);
      expect(stats.conversionRate).toBe(0);
      expect(stats.avgCheck).toBe(0);
    });
  });
});
