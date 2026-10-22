import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
      include: {
        children: { orderBy: { sortOrder: 'asc' }, take: 20 },
        _count: { select: { descendantOf: true } },
      },
    });
  }

  async findTree() {
    // Return top-level categories with nested children (ltree-based)
    const roots = await this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
    return roots;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: { orderBy: { sortOrder: 'asc' } },
        parent: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!category) throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, `Category ${slug} not found`);
    return category;
  }

  async findByPath(path: string) {
    // Use ltree operator to find all descendants
    return this.prisma.category.findMany({
      where: {
        path: { startsWith: path },
      },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    });
  }
}
