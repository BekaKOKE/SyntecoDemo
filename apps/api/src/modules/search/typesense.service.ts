import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Client } from 'typesense';

interface ProductDocument {
  id: string;
  variantId: string;
  title: string;
  description: string;
  brandName: string;
  categoryNames: string[];
  price: number;
  availability: string;
  imageUrl: string;
  mpn: string;
  stockTotal: number;
}

/**
 * Typesense search integration — provides sub-10ms full-text search
 * with typo tolerance, faceting, and Russian language support.
 *
 * Fallback: if Typesense is unavailable, search falls through to
 * the existing PostgreSQL FTS logic in SearchService.
 */
@Injectable()
export class TypesenseService implements OnModuleInit {
  private readonly logger = new Logger('TypesenseService');
  private client: Client | null = null;
  private available = false;
  private readonly COLLECTION = 'products';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaClient,
  ) {}

  async onModuleInit() {
    try {
      const host = this.config.get('TYPESENSE_HOST', 'localhost');
      const port = this.config.get('TYPESENSE_PORT', '8108');
      const apiKey = this.config.get('TYPESENSE_API_KEY', 'synteco_dev_key');

      this.client = new Client({
        nodes: [{ host, port: Number(port), protocol: 'http' }],
        apiKey,
        connectionTimeoutSeconds: 5,
      });

      // Verify connectivity
      await this.client!.health.retrieve();
      this.available = true;
      this.logger.log(`Typesense connected at ${host}:${port}`);

      // Ensure collection exists
      await this.ensureCollection();
    } catch (err: any) {
      this.logger.warn(`Typesense unavailable — search will use PostgreSQL fallback: ${err.message}`);
      this.available = false;
    }
  }

  isAvailable(): boolean {
    return this.available;
  }

  private async ensureCollection() {
    if (!this.client) return;

    try {
      await this.client.collections(this.COLLECTION).retrieve();
    } catch {
      // Collection doesn't exist — create it
      await this.client.collections().create({
        name: this.COLLECTION,
        default_sorting_field: 'price',
        fields: [
          { name: 'variantId', type: 'string', facet: false },
          { name: 'title', type: 'string', locale: 'ru' },
          { name: 'description', type: 'string', locale: 'ru', optional: true },
          { name: 'brandName', type: 'string', facet: true },
          { name: 'categoryNames', type: 'string[]', facet: true },
          { name: 'price', type: 'float', facet: true },
          { name: 'availability', type: 'string', facet: true },
          { name: 'imageUrl', type: 'string', index: false, optional: true },
          { name: 'mpn', type: 'string', optional: true },
          { name: 'stockTotal', type: 'int32', optional: true },
        ],
        token_separators: [' ', '-', '/', '.', ',', '(', ')'],
        symbols_to_index: ['+', '#', '&'],
      });
      this.logger.log(`Created Typesense collection: ${this.COLLECTION}`);
    }
  }

  async indexProduct(productId: string): Promise<void> {
    if (!this.client || !this.available) return;

    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: {
          brand: { select: { name: true } },
          categories: { include: { category: { select: { name: true } } } },
          stock: { select: { quantity: true, reserved: true } },
        },
      });

      if (!product) return;

      // Never index discontinued ("deleted") products. If an existing indexed
      // doc gets updated into a discontinued state, drop it from the index.
      if (!product.imageUrl || product.availability === 'discontinued') {
        await this.removeProduct(productId);
        return;
      }

      const doc = this.toDocument(product as any);
      await this.client.collections(this.COLLECTION).documents().upsert(doc);
    } catch (err: any) {
      this.logger.warn(`Failed to index product ${productId}: ${err.message}`);
    }
  }

  async removeProduct(productId: string): Promise<void> {
    if (!this.client || !this.available) return;
    try {
      await this.client.collections(this.COLLECTION).documents(productId).delete();
    } catch {
      // Already deleted or doesn't exist — ignore
    }
  }

  async search(params: {
    q: string;
    page?: number;
    limit?: number;
    brandId?: string;
    categoryId?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    sortBy?: string;
  }): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } } | null> {
    if (!this.client || !this.available) return null;

    try {
      const page = params.page ?? 1;
      const limit = params.limit ?? 24;

      const filterParts: string[] = [];
      // Never expose discontinued products (admin "delete"). Applied
      // unconditionally so stale indexed docs can't leak back into results.
      filterParts.push('availability:!= discontinued');
      if (params.priceMin) filterParts.push(`price:>=${params.priceMin}`);
      if (params.priceMax) filterParts.push(`price:<=${params.priceMax}`);
      if (params.inStock) filterParts.push('availability:in_stock');
      if (params.brandId) {
        // Resolve brand name from ID for faceting
        const brand = await this.prisma.brand.findUnique({
          where: { id: params.brandId },
          select: { name: true },
        });
        if (brand) filterParts.push(`brandName:${brand.name}`);
      }

      const searchParams: any = {
        q: params.q || '*',
        query_by: 'title,description,brandName,mpn,variantId',
        query_by_weights: '4,2,3,3,1',
        page,
        per_page: limit,
        include_fields: 'id,variantId,title,brandName,categoryNames,price,availability,imageUrl,mpn,stockTotal',
        highlight_fields: 'title',
        highlight_affix_num_tokens: 0,
        snippet_threshold: 30,
      };

      if (filterParts.length > 0) {
        searchParams.filter_by = filterParts.join(' && ');
      }

      const result = await this.client
        .collections(this.COLLECTION)
        .documents()
        .search(searchParams);

      // Map hits back to product objects
      const productIds = result.hits?.map((h: any) => h.document.id) ?? [];

      if (productIds.length === 0) {
        return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
      }

      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
          imageUrl: { not: null },
          NOT: { imageUrl: '' },
          // Defense in depth — never return discontinued ("deleted") rows
          // even if a stale doc is still in the Typesense index.
          availability: { not: 'discontinued' },
        },
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
          prices: { where: { tier: 'retail' }, take: 1 },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          stock: { select: { quantity: true, reserved: true } },
        },
      });

      // Sort to match Typesense result order
      const productMap = new Map(products.map(p => [p.id, p]));
      const ordered = productIds.map((id: string) => productMap.get(id)).filter(Boolean);

      return {
        data: ordered,
        meta: {
          page,
          limit,
          total: ordered.length,
          totalPages: Math.ceil(ordered.length / limit),
        },
      };
    } catch (err: any) {
      this.logger.warn(`Typesense search error: ${err.message}`);
      return null;
    }
  }

  async autocomplete(q: string, limit = 5): Promise<any[] | null> {
    if (!this.client || !this.available || !q || q.length < 2) return null;

    try {
      const result = await this.client
        .collections(this.COLLECTION)
        .documents()
        .search({
          q,
          query_by: 'title,brandName,variantId,mpn',
          per_page: limit,
          include_fields: 'id,variantId,title,brandName,price',
        });

      return (result.hits ?? []).map((h: any) => ({
        label: `${h.document.brandName} — ${h.document.title}`,
        value: h.document.variantId,
        type: 'product' as const,
        price: h.document.price,
      }));
    } catch {
      return null;
    }
  }

  /**
   * Index all products in new Typesense. Called manually or during initial setup.
   */
  async reindexAll(): Promise<{ indexed: number; errors: number }> {
    if (!this.client || !this.available) {
      return { indexed: 0, errors: 0 };
    }

    const products = await this.prisma.product.findMany({
      where: {
        imageUrl: { not: null },
        NOT: { imageUrl: '' },
        // Don't index discontinued ("deleted") products on rebuild.
        availability: { not: 'discontinued' },
      },
      include: {
        brand: { select: { name: true } },
        categories: { include: { category: { select: { name: true } } } },
        stock: { select: { quantity: true, reserved: true } },
      },
    });

    let indexed = 0;
    let errors = 0;

    // Index in batches of 100
    for (let i = 0; i < products.length; i += 100) {
      const batch = products.slice(i, i + 100);
      const docs = batch.map(p => this.toDocument(p as any));

      try {
        const result = await this.client
          .collections(this.COLLECTION)
          .documents()
          .import(docs, { action: 'upsert' });

        // Count successes
        const failed = (result as any).filter((r: any) => !r.success).length;
        indexed += docs.length - failed;
        errors += failed;

        this.logger.log(`Indexed batch ${Math.floor(i / 100) + 1}: ${docs.length - failed}/${docs.length}`);
      } catch (err: any) {
        this.logger.error(`Batch import failed: ${err.message}`);
        errors += docs.length;
      }

      // Small delay between batches to avoid overwhelming Typesense
      await new Promise(r => setTimeout(r, 100));
    }

    this.logger.log(`Reindex complete: ${indexed} indexed, ${errors} errors`);
    return { indexed, errors };
  }

  private toDocument(p: any): ProductDocument {
    const stockTotal = (p.stock ?? []).reduce(
      (sum: number, s: any) => sum + Number(s.quantity) - Number(s.reserved),
      0,
    );
    return {
      id: p.id,
      variantId: p.variantId,
      title: p.title,
      description: (p.description ?? '').substring(0, 2000),
      brandName: p.brand?.name ?? '',
      categoryNames: (p.categories ?? []).map((pc: any) => pc.category?.name).filter(Boolean),
      price: Number(p.price),
      availability: p.availability,
      imageUrl: p.imageUrl ?? '',
      mpn: p.mpn ?? '',
      stockTotal,
    };
  }
}
