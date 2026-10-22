import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(search?: string) {
    return this.prisma.brand.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: {
                imageUrl: { not: null },
                NOT: { imageUrl: '' },
              },
            },
          },
        },
      },
    });
  }

  async create(data: { name: string; website?: string }) {
    const existing = await this.prisma.brand.findUnique({ where: { name: data.name } });
    if (existing) throw new AppException(ErrorCode.BRAND_NAME_EXISTS, 'Бренд с таким названием уже существует');

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).slice(2, 8);

    return this.prisma.brand.create({
      data: {
        name: data.name,
        slug,
        website: data.website,
      },
    });
  }
}
