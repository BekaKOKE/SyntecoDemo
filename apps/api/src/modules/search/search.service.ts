import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { isCyrillic, expandRussianQuery } from './search-translations';
import { TypesenseService } from './typesense.service';

interface SearchQuery {
  q: string;
  page?: number;
  limit?: number;
  brandId?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sortBy?: string;
}

const PUBLIC_IMAGE_FILTER: Prisma.ProductWhereInput[] = [
  { imageUrl: { not: null } },
  { imageUrl: { not: '' } },
];

const ALLOWED_SORT_FIELDS = new Set(['createdAt', 'price', 'title', 'availability']);

/**
 * Prisma passes `_relevance.search` to PostgreSQL as a tsquery, not plain text.
 * A value such as "Twist Drill" is invalid tsquery syntax and crashes the
 * request. Convert user input to safe lexemes joined by the tsquery OR operator.
 */
function tokenizeSearchText(query: string): string[] {
  const tokens = query
    .normalize('NFKC')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu);

  if (!tokens) return [];

  return [...new Set(tokens.filter(token => token.length >= 2))];
}

function buildPostgresRelevanceQuery(query: string): string | null {
  const uniqueTokens = tokenizeSearchText(query);

  return uniqueTokens.length > 0 ? uniqueTokens.join(' | ') : null;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly typesense: TypesenseService,
  ) {}

  async search(query: SearchQuery) {
    const { q, page = 1, limit = 24, brandId, categoryId, priceMin, priceMax, inStock, sortBy = 'createdAt' } = query;
    const skip = (page - 1) * limit;
    const safeSortBy = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt';

    // Try Typesense first — if available, always use it (fast, typo-tolerant)
    // Falls back to PG when Typesense returns 0 results (e.g., Russian query on English-only data)
    if (this.typesense.isAvailable() && q && q.length >= 2) {
      const tsResult = await this.typesense.search({
        q: q.trim(), page, limit, brandId, categoryId, priceMin, priceMax, inStock, sortBy,
      });
      if (tsResult && tsResult.data.length > 0) {
        return { ...tsResult, query: q, engine: 'typesense' };
      }
    }

    // No query or Typesense down — use simple DB listing (fast, no ILIKE scan)
    const where: Prisma.ProductWhereInput = {
      AND: [
        ...PUBLIC_IMAGE_FILTER,
        // Never expose discontinued products — they are "deleted" from the
        // storefront perspective. Defense in depth: even if a discontinued
        // row lingers in the DB or Typesense index, search must hide it.
        { availability: { not: 'discontinued' } },
      ],
    };
    if (brandId) where.brandId = brandId;
    if (categoryId) where.categories = { some: { categoryId } };
    if (inStock) where.availability = 'in_stock';
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = priceMin;
      if (priceMax) where.price.lte = priceMax;
    }

    // If there's a real search query and Typesense is down, do PG ILIKE as last resort
    if (q && q.trim().length >= 2) {
      // A product must match every meaningful token in one query variant.
      // Russian and translated English variants remain alternatives to each other.
      // This prevents common words such as "boot", "size" or "in" from
      // independently matching hundreds of unrelated products.
      where.OR = expandRussianQuery(q)
        .map(tokenizeSearchText)
        .filter(tokens => tokens.length > 0)
        .map(tokens => ({
          AND: tokens.map(word => ({
            OR: [
              { title: { contains: word, mode: 'insensitive' as const } },
              { variantId: { contains: word, mode: 'insensitive' as const } },
              { mpn: { contains: word, mode: 'insensitive' as const } },
              { brand: { name: { contains: word, mode: 'insensitive' as const } } },
            ],
          })),
        }));
    }

    // Execute the query — simple filtered listing, or ILIKE fallback if Typesense was down
    // _relevance uses PostgreSQL tsquery which errors on Cyrillic text — skip it for Russian queries
    const relevanceQuery = q && q.trim().length >= 2 && (where as any).OR && !isCyrillic(q)
      ? buildPostgresRelevanceQuery(q)
      : null;
    const orderBy: any = relevanceQuery
      ? { _relevance: { fields: ['title'], search: relevanceQuery, sort: 'desc' } }
      : { [safeSortBy]: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true, title: true, variantId: true, price: true, salePrice: true,
          imageUrl: true, availability: true, mpn: true, description: true, descriptionRu: true,
          attributes: true, specifications: true, createdAt: true,
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          documents: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      query: q,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async autocomplete(q: string, limit = 5) {
    if (!q || q.length < 2) return [];

    // Translate Russian queries for autocomplete
    const searchTerms = expandRussianQuery(q);
    const orConditions: Prisma.ProductWhereInput[] = [];
    for (const term of searchTerms) {
      orConditions.push(
        { title: { contains: term, mode: 'insensitive' } },
        { variantId: { startsWith: term, mode: 'insensitive' } },
        { mpn: { startsWith: term, mode: 'insensitive' } },
        { brand: { name: { contains: term, mode: 'insensitive' } } },
      );
    }

    const products = await this.prisma.product.findMany({
      where: {
        AND: [
          ...PUBLIC_IMAGE_FILTER,
          { availability: { not: 'discontinued' } },
        ],
        OR: orConditions,
      },
      select: { id: true, variantId: true, title: true, brand: { select: { name: true } }, price: true },
      take: limit,
      orderBy: { _relevance: { fields: ['title'], search: q, sort: 'desc' } },
    });

    return products.map(p => ({
      variantId: p.variantId,
      title: p.title,
      brandName: p.brand?.name ?? '',
    }));
  }
}
