import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '../../common/errors/app-exception';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateProductDto, UpdateProductDto, ProductFilterDto, FacetsQueryDto } from './dto/product.dto';
import { TypesenseService } from '../search/typesense.service';

type AttributeFilterValue = string | string[];

interface AttributeFacetDefinition {
  name: string;
  keys: string[];
  maxValues?: number;
}

interface CategoryScope {
  categoryIds: string[];
  rootSlug?: string;
  path?: string;
}

const ATTRIBUTE_FACETS_BY_CATEGORY: Record<string, AttributeFacetDefinition[]> = {
  bezopasnost: [
    { name: 'Тип защиты', keys: ['Тип защиты', 'Protection Type', 'PPE Category', 'Product Type'] },
    { name: 'Размер', keys: ['Размер', 'Size'] },
    { name: 'Стандарт', keys: ['Стандарт', 'Standard', 'Standards', 'Rating'] },
    { name: 'Материал', keys: ['Материал', 'Material'] },
    { name: 'Цвет', keys: ['Цвет', 'Color'] },
    { name: 'Надпись / назначение', keys: ['Sign Legend', 'Sign Header'] },
    { name: 'Размер знака', keys: ['Nominal Sign Size', 'Overall Length', 'Overall Width'] },
    { name: 'Материал знака', keys: ['Sign Material Group'] },
    { name: 'Исполнение знака', keys: ['Sign Format', 'Sign Shape', 'Sign Mounting Style', 'Indoor/Outdoor Usage'] },
  ],
  instrumenty: [
    { name: 'Тип инструмента', keys: ['Тип инструмента', 'Tool Type', 'Product Type'] },
    { name: 'Длина', keys: ['Длина', 'Overall Length', 'Length'] },
    { name: 'Диаметр', keys: ['Диаметр', 'Overall Diameter', 'Diameter'] },
    { name: 'Толщина', keys: ['Толщина', 'Overall Thickness', 'Thickness'] },
    { name: 'Шаг зубьев', keys: ['Teeth per Inch'] },
    { name: 'Абразив', keys: ['Abrasive Material', 'Abrasive Grade'] },
    { name: 'Материал обработки', keys: ['For Workpiece Material', 'For Material Width', 'For Material Thickness'] },
    { name: 'Привод', keys: ['Привод', 'Drive Size', 'Drive'] },
    { name: 'Материал', keys: ['Материал', 'Material'] },
    { name: 'Питание', keys: ['Питание', 'Voltage', 'Power Source'] },
  ],
  elektrika: [
    { name: 'Напряжение', keys: ['Напряжение', 'Voltage', 'Voltage Rating', 'Rated Voltage'] },
    { name: 'Ток', keys: ['Ток', 'Amperage', 'Current Rating'] },
    { name: 'Полюса', keys: ['Number of Poles'] },
    { name: 'Фаза', keys: ['Фаза', 'Phase'] },
    { name: 'Длина', keys: ['Длина', 'Overall Length', 'Length'] },
    { name: 'Ширина', keys: ['Ширина', 'Overall Width', 'Width'] },
    { name: 'Материал', keys: ['Материал', 'Material'] },
    { name: 'Цвет', keys: ['Цвет', 'Color', 'Housing Color'] },
    { name: 'Степень защиты', keys: ['Степень защиты', 'IP Rating', 'NEMA Rating'] },
    { name: 'Класс / grade', keys: ['Grade'] },
  ],
  pnevmatika: [
    { name: 'Тип', keys: ['Тип', 'Product Type'] },
    { name: 'Рабочее давление', keys: ['Рабочее давление', 'Max Pressure', 'Operating Pressure'] },
    { name: 'Диаметр', keys: ['Диаметр', 'Bore Dia.', 'Inside Dia.', 'Outside Diameter'] },
    { name: 'Размер порта', keys: ['Размер порта', 'Port Size'] },
    { name: 'Материал корпуса', keys: ['Body Material', 'Материал', 'Material'] },
    { name: 'Серия', keys: ['Series'] },
    { name: 'Система измерения', keys: ['Measurement System'] },
    { name: 'Совместимость', keys: ['Compatible with Grainger Part Number', 'Compatible with Manufacturer Part Number', 'Compatible Manufacturer Model Number'] },
    { name: 'MPN', keys: ['Manufacturer Part Number'] },
  ],
  gidravlika: [
    { name: 'Тип', keys: ['Тип', 'Product Type'] },
    { name: 'Рабочее давление', keys: ['Рабочее давление', 'Max Pressure', 'Operating Pressure', 'Max. Working Pressure @ 70 F'] },
    { name: 'Размер резьбы', keys: ['Размер резьбы', 'Thread Size', 'Connection Size', 'Fitting Size'] },
    { name: 'Тип соединения', keys: ['Fitting Connection Type', 'Connection Type'] },
    { name: 'Диаметр', keys: ['Диаметр', 'Inside Dia.'] },
    { name: 'Материал', keys: ['Материал', 'Material', 'Body Material', 'Fitting Material'] },
    { name: 'Среда', keys: ['For Media Type', 'Media'] },
    { name: 'Совместимость', keys: ['Chemical Compatibility'] },
    { name: 'Электропараметры', keys: ['Rated Voltage', 'Phase'] },
  ],
  krepezh: [
    { name: 'Тип крепежа', keys: ['Тип крепежа', 'Fastener Type', 'Product Type'] },
    { name: 'Размер резьбы', keys: ['Размер резьбы', 'Thread Size'] },
    { name: 'Длина', keys: ['Длина', 'Length', 'Overall Length', 'Fastener Length'] },
    { name: 'Материал', keys: ['Материал', 'Material', 'Material Grade/Class', 'Material Grade'] },
    { name: 'Покрытие', keys: ['Покрытие', 'Finish', 'Finish Type', 'Coating'] },
    { name: 'Система измерения', keys: ['System of Measurement', 'Measurement System'] },
    { name: 'Тип головки', keys: ['Head Type'] },
    { name: 'Габариты', keys: ['Overall Height', 'Overall Width'] },
  ],
  podshipniki: [
    { name: 'Тип', keys: ['Тип', 'Bearing Type', 'Product Type'] },
    { name: 'Внутренний диаметр', keys: ['Внутренний диаметр', 'Inside Dia.', 'Bore Dia.', 'Bore Diameter'] },
    { name: 'Наружный диаметр', keys: ['Наружный диаметр', 'Outside Dia.', 'Outside Diameter'] },
    { name: 'Ширина', keys: ['Ширина', 'Width', 'Overall Width'] },
    { name: 'Длина', keys: ['Длина', 'Overall Length', 'Length'] },
    { name: 'Материал', keys: ['Материал', 'Material', 'Material Grade'] },
    { name: 'Закрытие', keys: ['Closure'] },
    { name: 'Номер подшипника', keys: ['Bearing Industry Number'] },
    { name: 'Система измерения', keys: ['System of Measurement', 'Measurement System'] },
  ],
  dvigateli: [
    { name: 'Мощность', keys: ['Мощность', 'HP', 'Power'] },
    { name: 'Напряжение', keys: ['Напряжение', 'Voltage', 'Voltage Rating', 'Rated Voltage'] },
    { name: 'Обороты', keys: ['Обороты', 'RPM'] },
    { name: 'Фаза', keys: ['Фаза', 'Phase'] },
    { name: 'Корпус', keys: ['Корпус', 'Frame'] },
    { name: 'Наружный диаметр', keys: ['Outside Diameter'] },
    { name: 'Внутренний диаметр', keys: ['Inside Diameter', 'Bore Diameter'] },
    { name: 'Ширина', keys: ['Overall Width', 'Top Width'] },
    { name: 'Материал', keys: ['Material', 'Lip Material'] },
    { name: 'Система измерения', keys: ['System of Measurement'] },
    { name: 'Industry number', keys: ['Industry Number'] },
    { name: 'Уплотнение', keys: ['Seal Design', 'For Shaft Type'] },
  ],
  svarka: [
    { name: 'Тип сварки', keys: ['Тип сварки', 'Welding Process', 'Product Type'] },
    { name: 'Материал', keys: ['Материал', 'Material'] },
    { name: 'Диаметр', keys: ['Диаметр', 'Diameter', 'Rod Diameter'] },
    { name: 'Сила тока', keys: ['Сила тока', 'Amperage', 'Welding Current Designation'] },
    { name: 'Размер', keys: ['Размер', 'Size'] },
    { name: 'AWS классификация', keys: ['AWS Classification'] },
    { name: 'Материал сварки', keys: ['For Material Type', 'For Material Grade'] },
    { name: 'Положение сварки', keys: ['For Welding Position'] },
    { name: 'Газ', keys: ['Compatible Gas Type'] },
    { name: 'Вес', keys: ['Weight'] },
    { name: 'Длина', keys: ['Overall Length', 'Length'] },
  ],
  santekhnika: [
    { name: 'Форма фитинга', keys: ['Fitting Shape'] },
    { name: 'Тип соединения', keys: ['Connection Type', 'End Connection Type', 'Connector Type'] },
    { name: 'Размер соединения', keys: ['Размер соединения', 'Connection Size', 'Pipe Size', 'Nominal Pipe Size', 'Fitting Size', 'For Tube OD'] },
    { name: 'Материал', keys: ['Материал', 'Material', 'Fitting Material'] },
    { name: 'Рабочее давление', keys: ['Рабочее давление', 'Max Pressure'] },
    { name: 'Среда', keys: ['Среда', 'Media', 'For Media Type'] },
    { name: 'Стандарт', keys: ['Стандарт', 'Standard', 'Standards'] },
    { name: 'Длина', keys: ['Overall Length', 'Length'] },
  ],
  uborka: [
    { name: 'Тип', keys: ['Тип', 'Product Type'] },
    { name: 'Назначение', keys: ['Назначение', 'Application'] },
    { name: 'Объем', keys: ['Объем', 'Capacity', 'Container Size'] },
    { name: 'Материал', keys: ['Материал', 'Material', 'Material Grade'] },
    { name: 'Цвет', keys: ['Цвет', 'Color'] },
    { name: 'Форма', keys: ['Shape'] },
    { name: 'Габариты', keys: ['Overall Length', 'Overall Width', 'Overall Height'] },
    { name: 'Рукоятка', keys: ['Handle Length', 'Handle Material'] },
  ],
  upakovka: [
    { name: 'Тип упаковки', keys: ['Тип упаковки', 'Product Type'] },
    { name: 'Длина', keys: ['Длина', 'Overall Length', 'Length'] },
    { name: 'Ширина', keys: ['Ширина', 'Overall Width', 'Width'] },
    { name: 'Высота', keys: ['Overall Height', 'Height'] },
    { name: 'Глубина', keys: ['Overall Depth', 'Depth'] },
    { name: 'Материал', keys: ['Материал', 'Material', 'Material Grade'] },
    { name: 'Цвет', keys: ['Цвет', 'Color'] },
    { name: 'Нагрузка', keys: ['Load Capacity', 'Duty Rating'] },
    { name: 'Полки', keys: ['Number of Shelves'] },
    { name: 'Толщина', keys: ['Thickness'] },
  ],
  laboratoriya: [
    { name: 'Тип', keys: ['Тип', 'Product Type'] },
    { name: 'Диапазон измерения', keys: ['Диапазон измерения', 'Measurement Range', 'Range'] },
    { name: 'Точность', keys: ['Точность', 'Accuracy'] },
    { name: 'Объем', keys: ['Объем', 'Capacity', 'Container Capacity'] },
    { name: 'Материал', keys: ['Материал', 'Material'] },
    { name: 'Контейнер', keys: ['Container Type'] },
    { name: 'Серия', keys: ['Series'] },
    { name: 'Система измерения', keys: ['Measurement System'] },
    { name: 'Габариты', keys: ['Overall Length', 'Overall Width', 'Overall Height'] },
    { name: 'Температура', keys: ['Maximum Operating Temperature', 'Operating Temperature Range'] },
  ],
  avtopark: [
    { name: 'Тип', keys: ['Тип', 'Product Type'] },
    { name: 'Совместимость', keys: ['Совместимость', 'For Use With'] },
    { name: 'Размер', keys: ['Размер', 'Size', 'Outside Diameter'] },
    { name: 'Материал', keys: ['Материал', 'Material'] },
    { name: 'Напряжение', keys: ['Напряжение', 'Voltage'] },
    { name: 'Цвет', keys: ['Цвет', 'Color'] },
    { name: 'Габариты', keys: ['Overall Length', 'Overall Width', 'Overall Height'] },
    { name: 'Привод', keys: ['Drive Size'] },
    { name: 'Емкость', keys: ['Container Capacity'] },
    { name: 'Температура', keys: ['Operating Temperature Range'] },
    { name: 'Присадки', keys: ['Primary Additives'] },
  ],
};

const DEFAULT_ATTRIBUTE_FACETS: AttributeFacetDefinition[] = [
  { name: 'Класс защиты', keys: ['Класс защиты', 'Protection Class', 'Protection Rating'] },
  { name: 'Тип', keys: ['Тип', 'Product Type'] },
  { name: 'Размер', keys: ['Размер', 'Size'] },
  { name: 'Материал', keys: ['Материал', 'Material'] },
  { name: 'Цвет', keys: ['Цвет', 'Color'] },
  { name: 'Стандарт', keys: ['Стандарт', 'Standard'] },
];

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly typesense: TypesenseService,
  ) {}

  async findAll(filter: ProductFilterDto) {
    const {
      page = 1, limit = 24, search, brandId, brandSlug,
      categoryId, categorySlug, availability,
      minPrice, maxPrice, warehouseId, inStockOnly, attributes,
      sortBy = 'relevance', sortDir = 'desc',
    } = filter;
    const skip = (page - 1) * limit;

    // Storefront must never see discontinued ("deleted") products.
    const where: Prisma.ProductWhereInput = {
      availability: { not: 'discontinued' },
    };

    // ── Brand filter ──
    if (brandSlug) {
      const brand = await this.prisma.brand.findUnique({ where: { slug: brandSlug } });
      if (!brand) {
        throw new AppException(ErrorCode.BRAND_NOT_FOUND, `Brand "${brandSlug}" not found`);
      }
      where.brandId = brand.id;
    } else if (brandId) {
      where.brandId = brandId;
    }

    // ── Search ──
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { variantId: { contains: search, mode: 'insensitive' } },
        { mpn: { contains: search, mode: 'insensitive' } },
      ];
    }

    // ── Category ──
    if (categoryId) {
      const scope = await this.resolveCategoryScope(categoryId);
      where.categories = { some: { categoryId: { in: scope.categoryIds } } };
    } else if (categorySlug) {
      const scope = await this.resolveCategoryScopeBySlug(categorySlug);
      where.categories = { some: { categoryId: { in: scope.categoryIds } } };
    }

    // ── Availability ──
    if (availability) {
      where.availability = availability;
    } else {
      where.availability = { not: 'discontinued' };
    }

    // ── Price range ──
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) (where.price as any).gte = minPrice;
      if (maxPrice !== undefined) (where.price as any).lte = maxPrice;
    }

    // ── JSONB attributes filter ──
    // Parse the attributes param (JSON string) into Prisma JSON path filters.
    // Invalid JSON is silently ignored — the filter just doesn't apply.
    if (attributes) {
      try {
        const attrObj = JSON.parse(attributes) as Record<string, AttributeFilterValue>;
        const attrClauses = Object.entries(attrObj)
          .map(([key, rawValue]) => {
            const values = (Array.isArray(rawValue) ? rawValue : [rawValue])
              .map(value => String(value).trim())
              .filter(Boolean);

            if (values.length === 0) return null;

            const clauses = values.map(value => ({
              attributes: { path: [key], equals: value },
            }));

            return clauses.length === 1 ? clauses[0] : { OR: clauses };
          })
          .filter(Boolean);
        if (attrClauses.length > 0) {
          where.AND = [...(where.AND as any[] | undefined ?? []), ...attrClauses];
        }
      } catch {
        // Invalid JSON — ignore the filter silently
      }
    }

    // ── Stock / warehouse filters ──
    if (warehouseId) {
      where.stock = {
        some: {
          warehouseId,
          ...(inStockOnly ? { quantity: { gt: 0 } } : {}),
        },
      };
    } else if (inStockOnly) {
      where.stock = { some: { quantity: { gt: 0 } } };
    }

    const productSelect = {
      id: true, variantId: true, itemId: true, title: true, description: true,
      descriptionRu: true,
      brandId: true, imageUrl: true, price: true, salePrice: true,
      availability: true, groupId: true, hasVariations: true, mpn: true,
      attributes: true, specifications: true,
      createdAt: true, updatedAt: true,
      brand: { select: { id: true, name: true, slug: true } },
      categories: {
        include: { category: { select: { id: true, name: true, slug: true, path: true } } },
      },
      prices: { where: { tier: 'retail' }, take: 1 },
      stock: { include: { warehouse: { select: { id: true, name: true, code: true } } } },
      images: { orderBy: { sortOrder: 'asc' }, take: 5 },
      documents: { orderBy: { createdAt: 'desc' }, take: 5 },
    } satisfies Prisma.ProductSelect;

    // «relevance» (default): best products first — quality score combines
    // photo, Russian title, known brand, attributes, description and stock.
    // Unclear/low-quality products sink to the end; the image-first split
    // below additionally pushes photo-less products to the very end.
    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      sortBy === 'relevance'
        ? [{ qualityScore: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }]
        : [
            { [sortBy]: sortDir } as Prisma.ProductOrderByWithRelationInput,
            { id: 'asc' as const },
          ];
    const withImageWhere: Prisma.ProductWhereInput = {
      AND: [where, { imageUrl: { not: null } }, { imageUrl: { not: '' } }],
    };
    const withoutImageWhere: Prisma.ProductWhereInput = {
      AND: [where, { OR: [{ imageUrl: null }, { imageUrl: '' }] }],
    };

    const [total, withImageTotal] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.count({ where: withImageWhere }),
    ]);

    const products = [];
    if (skip < withImageTotal) {
      products.push(...await this.prisma.product.findMany({
        where: withImageWhere,
        skip,
        take: Math.min(limit, withImageTotal - skip),
        orderBy,
        select: productSelect,
      }));
    }

    const remaining = limit - products.length;
    if (remaining > 0) {
      products.push(...await this.prisma.product.findMany({
        where: withoutImageWhere,
        skip: Math.max(0, skip - withImageTotal),
        take: remaining,
        orderBy,
        select: productSelect,
      }));
    }

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Compute filter facets (available values + counts) for a given scope.
   * Used by the brand catalog page to render the filter sidebar.
   */
  async getFacets(filter: FacetsQueryDto): Promise<{
    priceRange: { min: number; max: number };
    brands: Array<{ id: string; name: string; count: number }>;
    attributes: Array<{ name: string; displayName?: string; priority: boolean; values: Array<{ value: string; count: number }> }>;
    warehouses: Array<{ id: string; name: string; count: number }>;
  }> {
    // ── Build the same where-clause prefix as findAll (without pagination/sort) ──
    const where: Prisma.ProductWhereInput = {
      availability: { not: 'discontinued' },
    };
    let scopedCategorySlug: string | undefined;
    let categoryScope: CategoryScope | undefined;

    if (filter.brandSlug) {
      const brand = await this.prisma.brand.findUnique({ where: { slug: filter.brandSlug } });
      if (!brand) {
        throw new AppException(ErrorCode.BRAND_NOT_FOUND, `Brand "${filter.brandSlug}" not found`);
      }
      where.brandId = brand.id;
    }

    if (filter.categoryId) {
      categoryScope = await this.resolveCategoryScope(filter.categoryId);
      where.categories = { some: { categoryId: { in: categoryScope.categoryIds } } };
      scopedCategorySlug = categoryScope.rootSlug;
    } else if (filter.categorySlug) {
      categoryScope = await this.resolveCategoryScopeBySlug(filter.categorySlug);
      where.categories = { some: { categoryId: { in: categoryScope.categoryIds } } };
      scopedCategorySlug = categoryScope.rootSlug;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { variantId: { contains: filter.search, mode: 'insensitive' } },
        { mpn: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    // ── Price range via aggregate ──
    const priceAgg = await this.prisma.product.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    });

    // ── Brand counts via groupBy on ProductBrand ──
    const brandGroups = await this.prisma.product.groupBy({
      by: ['brandId'],
      where,
      _count: { _all: true },
    });
    const brandIds = brandGroups.map(g => g.brandId).filter(Boolean);
    const brandsRaw = brandIds.length > 0
      ? await this.prisma.brand.findMany({
          where: { id: { in: brandIds } },
          select: { id: true, name: true },
        })
      : [];
    const brands = brandsRaw
      .map(b => {
        const group = brandGroups.find(g => g.brandId === b.id);
        return { id: b.id, name: b.name, count: group?._count._all ?? 0 };
      })
      .filter(b => b.count > 0)
      .sort((a, b) => b.count - a.count);

    // ── Attribute value counts via raw SQL JSONB aggregation ──
    // Fast with the GIN index; GROUP BY over jsonb_each_text.
    const brandId = filter.brandSlug
      ? await this.resolveBrandId(filter.brandSlug)
      : null;

    const attrRows = await this.prisma.$queryRaw<
      Array<{ key: string; value: string; count: bigint }>
    >(Prisma.sql`
      SELECT e.key AS key, e.value AS value, COUNT(*)::bigint AS count
      FROM "product"."products" p
      CROSS JOIN LATERAL jsonb_each_text(p.attributes) AS e(key, value)
      WHERE 1 = 1
      AND p.availability <> 'discontinued'
      ${brandId ? Prisma.sql`AND p.brand_id = ${brandId}::uuid` : Prisma.empty}
      ${categoryScope?.path ? Prisma.sql`AND p.id IN (
        SELECT pc.product_id
        FROM "product"."product_categories" pc
        JOIN "product"."categories" c ON c.id = pc.category_id
        WHERE c.path::text = ${categoryScope.path} OR c.path::text LIKE ${`${categoryScope.path}.%`}
      )` : filter.categoryId ? Prisma.sql`AND p.id IN (
        SELECT pc.product_id FROM "product"."product_categories" pc WHERE pc.category_id = ${filter.categoryId}::uuid
      )` : Prisma.empty}
      ${filter.search ? Prisma.sql`AND (
        p.title ILIKE ${`%${filter.search}%`}
        OR p.variant_id ILIKE ${`%${filter.search}%`}
        OR p.mpn ILIKE ${`%${filter.search}%`}
      )` : Prisma.empty}
      GROUP BY e.key, e.value
      ORDER BY e.key, count DESC
    `);

    // Group rows by attribute name; values sorted by count desc
    // (defense-in-depth: SQL already sorts, but ensure it regardless of mock/real source)
    const attrMap = new Map<string, Array<{ value: string; count: number }>>();
    for (const row of attrRows) {
      const name = row.key;
      const entry = { value: row.value, count: Number(row.count) };
      if (!attrMap.has(name)) attrMap.set(name, []);
      attrMap.get(name)!.push(entry);
    }
    for (const values of attrMap.values()) {
      values.sort((a, b) => b.count - a.count);
    }
    const attributes = this.buildAttributeFacets(attrMap, scopedCategorySlug);

    // ── Warehouse counts via groupBy on ProductStock ──
    const stockGroups = await this.prisma.productStock.groupBy({
      by: ['warehouseId'],
      where: { product: where },
      _count: { _all: true },
    });

    const warehousesRaw = await this.prisma.warehouse.findMany({
      where: { id: { in: stockGroups.map((g: any) => g.warehouseId) } },
      select: { id: true, name: true },
    });

    const warehouses = warehousesRaw
      .map((w: any) => {
        const group = stockGroups.find((g: any) => g.warehouseId === w.id);
        return { id: w.id, name: w.name, count: group?._count._all ?? 0 };
      })
      .filter((w: any) => w.count > 0);

    return {
      priceRange: {
        min: priceAgg._min.price ? Number(priceAgg._min.price) : 0,
        max: priceAgg._max.price ? Number(priceAgg._max.price) : 0,
      },
      brands,
      attributes,
      warehouses,
    };
  }

  private buildAttributeFacets(
    attrMap: Map<string, Array<{ value: string; count: number }>>,
    categorySlug?: string,
  ) {
    const definitions = categorySlug
      ? ATTRIBUTE_FACETS_BY_CATEGORY[categorySlug] ?? DEFAULT_ATTRIBUTE_FACETS
      : DEFAULT_ATTRIBUTE_FACETS;

    const usedKeys = new Set<string>();
    const curated = definitions
      .map(definition => {
        const key = definition.keys.find(candidate => attrMap.has(candidate));
        if (!key) return null;

        definition.keys.forEach(alias => usedKeys.add(alias));
        return {
          name: key,
          displayName: definition.name,
          priority: true,
          values: attrMap.get(key)!.slice(0, definition.maxValues ?? 12),
        };
      })
      .filter((facet): facet is { name: string; displayName: string; priority: boolean; values: Array<{ value: string; count: number }> } => Boolean(facet));

    const fallback = Array.from(attrMap.entries())
      .filter(([name, values]) => !usedKeys.has(name) && values.length > 1 && values.length <= 50)
      .sort((a, b) => {
        const totalA = a[1].reduce((sum, value) => sum + value.count, 0);
        const totalB = b[1].reduce((sum, value) => sum + value.count, 0);
        return totalB - totalA;
      })
      .slice(0, Math.max(0, 8 - curated.length))
      .map(([name, values]) => ({ name, displayName: name, priority: false, values: values.slice(0, 12) }));

    return [...curated, ...fallback];
  }

  private async resolveCategoryScope(categoryId: string): Promise<CategoryScope> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        slug: true,
        path: true,
      },
    });

    if (!category) {
      return { categoryIds: [categoryId] };
    }

    const descendants = await this.prisma.category.findMany({
      where: {
        OR: [
          { path: category.path },
          { path: { startsWith: `${category.path}.` } },
        ],
      },
      select: { id: true },
    });

    return {
      categoryIds: descendants.length > 0 ? descendants.map(item => item.id) : [category.id],
      rootSlug: category.path.split('.')[0] || category.slug,
      path: category.path,
    };
  }

  private async resolveCategoryScopeBySlug(categorySlug: string): Promise<CategoryScope> {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true, slug: true, path: true },
    });

    if (!category) {
      throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, `Category "${categorySlug}" not found`);
    }

    const descendants = await this.prisma.category.findMany({
      where: {
        OR: [
          { path: category.path },
          { path: { startsWith: `${category.path}.` } },
        ],
      },
      select: { id: true },
    });

    return {
      categoryIds: descendants.length > 0 ? descendants.map(item => item.id) : [category.id],
      rootSlug: category.path.split('.')[0] || category.slug,
      path: category.path,
    };
  }

  /** Helper: resolve brand slug to ID (used by raw SQL facet query). */
  private async resolveBrandId(brandSlug: string): Promise<string> {
    const brand = await this.prisma.brand.findUnique({ where: { slug: brandSlug } });
    if (!brand) {
      throw new AppException(ErrorCode.BRAND_NOT_FOUND, `Brand "${brandSlug}" not found`);
    }
    return brand.id;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true, variantId: true, itemId: true, title: true, description: true,
        descriptionRu: true,
        brandId: true, imageUrl: true, price: true, salePrice: true,
        availability: true, groupId: true, hasVariations: true, mpn: true,
        attributes: true, specifications: true,
        metaTitle: true, metaDescription: true,
        createdAt: true, updatedAt: true,
        brand: true,
        categories: { include: { category: true } },
        variants: true,
        prices: { orderBy: { minQuantity: 'asc' } },
        stock: { include: { warehouse: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        documents: true,
        specEntries: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product ${id} not found`);
    return product;
  }

  async findByVariantId(variantId: string) {
    const product = await this.prisma.product.findUnique({
      where: { variantId },
      include: { brand: true, categories: { include: { category: true } }, prices: true, stock: true },
    });
    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product with SKU ${variantId} not found`);
    // Hide discontinued ("deleted") products from the storefront PDP.
    if (product.availability === 'discontinued') {
      throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product with SKU ${variantId} not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        variantId: dto.variantId,
        itemId: dto.itemId === '0' ? null : dto.itemId,
        title: dto.title,
        description: dto.description,
        brandId: dto.brandId,
        price: dto.price,
        salePrice: dto.salePrice,
        mpn: dto.mpn,
        imageUrl: dto.imageUrl,
        availability: dto.availability ?? 'in_stock',
        attributes: dto.attributes ?? {},
        categories: dto.categoryIds
          ? { create: dto.categoryIds.map((categoryId: string) => ({ categoryId })) }
          : undefined,
      },
      include: { brand: true, categories: { include: { category: true } } },
    });

    // Create stock records if provided
    if (dto.stock && dto.stock.length > 0) {
      await this.prisma.productStock.createMany({
        data: dto.stock
          .filter(s => s.quantity > 0)
          .map(s => ({
            productId: product.id,
            warehouseId: s.warehouseId,
            quantity: s.quantity,
          })),
      });
    }

    // Sync to Typesense (fire-and-forget)
    this.typesense.indexProduct(product.id).catch(() => {});

    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product ${id} not found`);

    // Update categories if provided
    if (dto.categoryIds) {
      await this.prisma.productCategory.deleteMany({ where: { productId: id } });
      if (dto.categoryIds.length > 0) {
        await this.prisma.productCategory.createMany({
          data: dto.categoryIds.map((categoryId: string) => ({ productId: id, categoryId })),
        });
      }
    }

    // Update stock if provided
    if (dto.stock) {
      for (const s of dto.stock) {
        await this.prisma.productStock.upsert({
          where: { productId_warehouseId: { productId: id, warehouseId: s.warehouseId } },
          create: { productId: id, warehouseId: s.warehouseId, quantity: s.quantity },
          update: { quantity: s.quantity },
        });
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.variantId !== undefined && { variantId: dto.variantId }),
        ...(dto.brandId !== undefined && { brandId: dto.brandId }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.salePrice !== undefined && { salePrice: dto.salePrice }),
        ...(dto.availability !== undefined && { availability: dto.availability }),
        ...(dto.mpn !== undefined && { mpn: dto.mpn }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.attributes !== undefined && { attributes: dto.attributes }),
      },
      include: { brand: true, categories: { include: { category: true } } },
    });

    // Sync to Typesense
    this.typesense.indexProduct(id).catch(() => {});

    return updated;
  }

  /**
   * Delete a product permanently.
   *
   * Removes the product from the Typesense search index FIRST (awaited, not
   * fire-and-forget) so that no stale document can reappear in search after
   * deletion, then hard-deletes the DB row and all related records.
   *
   * Formerly this was a soft delete (setting availability: 'discontinued'),
   * but the storefront search did not filter discontinued products, which
   * caused "deleted" items to keep showing up. Hard delete is the correct
   * behavior for an admin "remove" action — the user expects the item to
   * disappear from the site immediately and completely.
   */
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product ${id} not found`);

    // 1. Remove from search index first (awaited so it really happens
    //    before the DB row is gone — never fire-and-forget here).
    try {
      await this.typesense.removeProduct(id);
    } catch {
      // Index may already be clean; safe to ignore.
    }

    // 2. Hard-delete related records + product row in one transaction.
    await this.prisma.$transaction([
      this.prisma.productCategory.deleteMany({ where: { productId: id } }),
      this.prisma.productVariant.deleteMany({ where: { productId: id } }),
      this.prisma.productImage.deleteMany({ where: { productId: id } }),
      this.prisma.productDocument.deleteMany({ where: { productId: id } }),
      this.prisma.productPrice.deleteMany({ where: { productId: id } }),
      this.prisma.productStock.deleteMany({ where: { productId: id } }),
      this.prisma.productSpecification.deleteMany({ where: { productId: id } }),
    ]);

    return this.prisma.product.delete({ where: { id } });
  }

  /** Hard delete (admin-only, irreversible). Use with caution. */
  async hardDelete(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, `Product ${id} not found`);

    // Remove from search index first so no phantom document lingers.
    try {
      await this.typesense.removeProduct(id);
    } catch {
      // Ignore — index may already be clean.
    }

    // Delete related records first (no cascade in schema)
    await this.prisma.$transaction([
      this.prisma.productCategory.deleteMany({ where: { productId: id } }),
      this.prisma.productVariant.deleteMany({ where: { productId: id } }),
      this.prisma.productImage.deleteMany({ where: { productId: id } }),
      this.prisma.productDocument.deleteMany({ where: { productId: id } }),
      this.prisma.productPrice.deleteMany({ where: { productId: id } }),
      this.prisma.productStock.deleteMany({ where: { productId: id } }),
      this.prisma.productSpecification.deleteMany({ where: { productId: id } }),
    ]);

    return this.prisma.product.delete({ where: { id } });
  }
}
