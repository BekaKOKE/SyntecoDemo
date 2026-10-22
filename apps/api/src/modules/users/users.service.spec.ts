import { Test, TestingModule } from '@nestjs/testing';
import { AppException } from '../../common/errors/app-exception';
import { PrismaClient } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaClient, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // ── findAll ──────────────────────────────────────────
  describe('findAll', () => {
    const users = [
      { id: 'u1', email: 'admin@synteco.kz', firstName: 'Admin', lastName: 'User', role: 'super_admin', isActive: true, companyId: null, lastLoginAt: new Date(), createdAt: new Date() },
      { id: 'u2', email: 'buyer@company.kz', firstName: 'Test', lastName: 'Buyer', role: 'customer_buyer', isActive: true, companyId: 'c1', lastLoginAt: null, createdAt: new Date() },
    ];

    it('should return paginated users without password hashes', async () => {
      prisma.user.findMany.mockResolvedValue(users);
      prisma.user.count.mockResolvedValue(2);

      const result = await service.findAll(1, 20);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      // Verify passwordHash fields are excluded via select
      expect(result.data[0]).not.toHaveProperty('passwordHash');
    });

    it('should apply pagination correctly', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(50);

      const result = await service.findAll(3, 10);
      expect(result.meta.page).toBe(3);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(50);
    });

    it('should sort by createdAt descending', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.findAll();
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } })
      );
    });

    it('should select only safe fields (no passwordHash)', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.findAll();
      const call = prisma.user.findMany.mock.calls[0][0];
      expect(call.select).toBeDefined();
      expect(call.select.passwordHash).toBeUndefined();
      expect(call.select.id).toBe(true);
      expect(call.select.email).toBe(true);
      expect(call.select.role).toBe(true);
    });

    it('should handle empty user list', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      const result = await service.findAll();
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  // ── findById ─────────────────────────────────────────
  describe('findById', () => {
    const fullUser = {
      id: 'u1', email: 'admin@synteco.kz', passwordHash: '$2a$12$hash',
      firstName: 'Admin', lastName: 'User', phone: '+7701', role: 'super_admin',
      isActive: true, companyId: null, company: null,
      lastLoginAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
      refreshTokens: [],
    };

    it('should return user without passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue(fullUser);

      const user = await service.findById('u1');
      expect(user.id).toBe('u1');
      expect(user.email).toBe('admin@synteco.kz');
      expect(user).not.toHaveProperty('passwordHash');
      expect(user.company).toBeNull();
    });

    it('should include company information when available', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...fullUser,
        company: { id: 'c1', name: 'TestCo', bin: '123456789012' },
      });

      const user = await service.findById('u1');
      expect(user.company).toBeDefined();
      expect(user.company.name).toBe('TestCo');
    });

    it('should throw NotFoundException for missing user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(AppException);
    });
  });
});
