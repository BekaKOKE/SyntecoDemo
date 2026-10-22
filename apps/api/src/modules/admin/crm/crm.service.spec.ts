import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { CrmService } from './crm.service';

/** Create a Prisma Decimal-like mock that works with Number() */
const dec = (n: number) => ({ toNumber: () => n, valueOf: () => n, toString: () => String(n) });

describe('CrmService', () => {
  let service: CrmService;
  let prisma: any;
  const now = new Date('2026-06-09T12:00:00Z');

  beforeEach(async () => {
    prisma = {
      deal: {
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrmService, { provide: PrismaClient, useValue: prisma }],
    }).compile();
    service = module.get<CrmService>(CrmService);
  });

  describe('getPipeline', () => {
    it('should return kanban columns grouped by stage', async () => {
      prisma.deal.findMany.mockResolvedValue([
        { id: 'd1', dealNumber: 'DL-001', title: 'Deal 1', companyName: 'Acme', contactName: 'John', contactPhone: null, value: dec(100000), stage: 'inquiry', priority: 'normal', daysInStage: 2, ownerId: 'u1', ownerName: 'A K', hot: false, notes: null, stageEnteredAt: now, createdAt: now, updatedAt: now },
        { id: 'd2', dealNumber: 'DL-002', title: 'Deal 2', companyName: 'Beta', contactName: 'Jane', contactPhone: null, value: dec(50000), stage: 'qualification', priority: 'high', daysInStage: 5, ownerId: 'u2', ownerName: 'B L', hot: true, notes: null, stageEnteredAt: now, createdAt: now, updatedAt: now },
      ]);
      const pipeline = await service.getPipeline();
      expect(pipeline).toHaveLength(5);
      expect(pipeline[0].id).toBe('inquiry');
      expect(pipeline[0].label).toBe('Заявки');
      expect(pipeline[0].wip).toBe(1);
      expect(pipeline[0].sum).toBe(100000);
      expect(pipeline[1].sum).toBe(50000);
    });

    it('should return empty columns when no deals exist', async () => {
      prisma.deal.findMany.mockResolvedValue([]);
      const pipeline = await service.getPipeline();
      expect(pipeline).toHaveLength(5);
      pipeline.forEach(col => { expect(col.wip).toBe(0); expect(col.sum).toBe(0); });
    });
  });

  describe('create', () => {
    it('should create a deal with auto-generated number', async () => {
      prisma.deal.findFirst.mockResolvedValue(null);
      prisma.deal.create.mockResolvedValue({
        id: 'd1', dealNumber: 'DL-26-00001', title: 'New Deal', companyName: 'TestCo',
        contactName: null, contactPhone: null, value: dec(50000),
        stage: 'inquiry', priority: 'normal', ownerId: null, ownerName: null,
        hot: false, notes: null, stageEnteredAt: now, createdAt: now, updatedAt: now,
      });
      const result = await service.create({ title: 'New Deal', companyName: 'TestCo', value: 50000 });
      expect(result.dealNumber).toBe('DL-26-00001');
      expect(result.title).toBe('New Deal');
      expect(result.value).toBe(50000);
    });

    it('should generate sequential deal numbers', async () => {
      prisma.deal.findFirst.mockResolvedValue({ dealNumber: 'DL-26-00042' });
      prisma.deal.create.mockResolvedValue({
        id: 'd1', dealNumber: 'DL-26-00043', title: 'T', companyName: 'C',
        contactName: null, contactPhone: null, value: dec(0),
        stage: 'inquiry', priority: 'normal', ownerId: null, ownerName: null,
        hot: false, notes: null, stageEnteredAt: now, createdAt: now, updatedAt: now,
      });
      const result = await service.create({ title: 'T', companyName: 'C', value: 0 });
      expect(result.dealNumber).toBe('DL-26-00043');
    });

    it('should create deal with custom stage and priority', async () => {
      prisma.deal.findFirst.mockResolvedValue(null);
      prisma.deal.create.mockResolvedValue({
        id: 'd1', dealNumber: 'DL-26-00001', title: 'Hot Deal', companyName: 'C',
        contactName: 'John', contactPhone: '+7701', value: dec(100000),
        stage: 'quote_sent', priority: 'high', ownerId: 'u1', ownerName: 'A K',
        hot: true, notes: 'Urgent', stageEnteredAt: now, createdAt: now, updatedAt: now,
      });
      const result = await service.create({ title: 'Hot Deal', companyName: 'C', value: 100000, stage: 'quote_sent', priority: 'high', hot: true });
      expect(result.stage).toBe('quote_sent');
      expect(result.hot).toBe(true);
    });
  });

  describe('update', () => {
    it('should update deal fields', async () => {
      prisma.deal.findUniqueOrThrow.mockResolvedValue({ id: 'd1', dealNumber: 'DL-001', title: 'Old', stage: 'inquiry', stageEnteredAt: now });
      prisma.deal.update.mockResolvedValue({
        id: 'd1', dealNumber: 'DL-001', title: 'Updated', companyName: 'C',
        contactName: null, contactPhone: null, value: dec(200000),
        stage: 'inquiry', priority: 'normal', daysInStage: 0, ownerId: null, ownerName: null,
        hot: false, notes: null, stageEnteredAt: now, createdAt: now, updatedAt: now,
      });
      await service.update('d1', { title: 'Updated', value: 200000 });
      expect(prisma.deal.update).toHaveBeenCalled();
    });

    it('should reset daysInStage when stage changes', async () => {
      prisma.deal.findUniqueOrThrow.mockResolvedValue({ id: 'd1', dealNumber: 'DL-001', title: 'D', stage: 'inquiry', stageEnteredAt: now });
      prisma.deal.update.mockResolvedValue({});
      await service.update('d1', { stage: 'qualification' });
      const data = prisma.deal.update.mock.calls[0][0].data;
      expect(data.stageEnteredAt).toBeDefined();
      expect(data.daysInStage).toBe(0);
    });

    it('should not reset stage timer when stage unchanged', async () => {
      prisma.deal.findUniqueOrThrow.mockResolvedValue({ id: 'd1', title: 'D', stage: 'qualification', stageEnteredAt: now });
      prisma.deal.update.mockResolvedValue({});
      await service.update('d1', { title: 'Updated' });
      const data = prisma.deal.update.mock.calls[0][0].data;
      expect(data.stageEnteredAt).toBeUndefined();
    });

    it('should strip protected fields (id, dealNumber)', async () => {
      prisma.deal.findUniqueOrThrow.mockResolvedValue({ id: 'd1', dealNumber: 'DL-001' });
      prisma.deal.update.mockResolvedValue({});
      await service.update('d1', { dealNumber: 'HACKED' as any, id: 'hacked-id' as any, title: 'D' });
      const data = prisma.deal.update.mock.calls[0][0].data;
      expect(data.dealNumber).toBeUndefined();
      expect(data.id).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete a deal', async () => {
      prisma.deal.delete.mockResolvedValue({});
      await service.remove('d1');
      expect(prisma.deal.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
    });
  });
});
