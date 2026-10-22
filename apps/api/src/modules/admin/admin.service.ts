import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStats() {
    const [
      productCount,
      brandCount,
      categoryCount,
      orderCount,
      userCount,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.brand.count(),
      this.prisma.category.count(),
      this.prisma.order.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ['cancelled', 'returned'] } },
      }),
    ]);

    return {
      productCount,
      brandCount,
      categoryCount,
      orderCount,
      userCount,
      totalRevenue: Number(totalRevenue._sum.total ?? 0),
    };
  }

  async getRecentOrders(limit = 10) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });
  }
}
