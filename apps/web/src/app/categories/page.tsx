'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getCategoryTree, type Category } from '@/lib/api/categories';
import styles from './CategoriesPage.module.css';

const QUICK_LINKS = [
  { label: 'Респираторы', slug: 'respirators' },
  { label: 'Защита рук', slug: 'zashchita-ruk' },
  { label: 'Кабели и провода', slug: 'kabeli' },
  { label: 'Болты и винты', slug: 'bolty-vinty' },
  { label: 'Пневмоцилиндры', slug: 'pnevmo-tsilindry' },
  { label: 'Огнетушители', slug: 'fire-extinguishers' },
  { label: 'Замки LOTO', slug: 'loto-locks' },
  { label: 'Абразивы', slug: 'abrazivy' },
];

const BRAND_LINKS = [
  { name: 'Ansul', href: '/brands/ansul' },
  { name: 'Honeywell', href: '/brands/honeywell' },
  { name: 'PIP', href: '/brands/pip' },
  { name: '3M', href: '/brands/3m' },
  { name: 'Master Lock', href: '/brands/master-lock' },
  { name: 'Uvex', href: '/brands/uvex' },
  { name: 'Parker', href: '/search?q=Parker' },
  { name: 'SMC', href: '/search?q=SMC' },
];

const CATEGORY_SEARCH_ALIASES: Record<string, string[]> = {
  'zashchita-ruk': ['перчатки', 'рукавицы', 'нитриловые перчатки'],
  'zashchita-glaz': ['очки', 'защитные очки', 'goggles'],
  'zashchita-slukha': ['беруши', 'наушники', 'слух'],
  respirators: ['маски', 'респиратор', '3m'],
  'fire-extinguishers': ['огнетушитель', 'пожарная безопасность'],
  'loto-locks': ['loto', 'lockout', 'tagout', 'замки'],
  kabeli: ['кабель', 'провод', 'провода', 'cord', 'wire'],
  'kabel-kanaly': ['кабель канал', 'кабель-канал', 'wire duct'],
  'bolty-vinty': ['болт', 'болты', 'винт', 'винты', 'screw'],
  gayki: ['гайка', 'гайки', 'nut'],
  shayby: ['шайба', 'шайбы', 'washer'],
  ankery: ['анкер', 'анкера', 'anchors'],
  'pnevmo-tsilindry': ['пневмоцилиндр', 'цилиндр', 'air cylinder'],
  'pnevmo-klapany': ['пневмоклапан', 'пневмо клапан'],
  klapany: ['клапан', 'клапаны', 'valve'],
  nasosy: ['насос', 'насосы', 'pump'],
  'podshipniki-main': ['подшипник', 'подшипники', 'bearing'],
  abrazivy: ['абразив', 'абразивы', 'шлифовка', 'grinding'],
  'ruchnoy-instrument': ['ключи', 'отвертки', 'ручной инструмент'],
  elektroinstrumenty: ['дрель', 'болгарка', 'шуруповерт', 'power tool'],
};

function flattenCategories(categories: Category[]) {
  const bySlug = new Map<string, Category>();

  function walk(items: Category[]) {
    for (const item of items) {
      bySlug.set(item.slug, item);
      if (item.children?.length) walk(item.children);
    }
  }

  walk(categories);
  return bySlug;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function formatCount(value: number | undefined) {
  return (value ?? 0).toLocaleString('ru-RU');
}

function sortByCount(items: Category[]) {
  return [...items].sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0) || a.name.localeCompare(b.name, 'ru'));
}

function categoryMatches(category: Category, query: string) {
  if (!query) return true;
  const aliases = CATEGORY_SEARCH_ALIASES[category.slug]?.join(' ') ?? '';
  const haystack = `${category.name} ${category.slug} ${aliases}`.toLowerCase();
  return haystack.includes(query);
}

function categoryOrSearchHref(slug: string, bySlug: Map<string, Category>, label: string) {
  return bySlug.has(slug) ? `/categories/${slug}` : `/search?q=${encodeURIComponent(label)}`;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);

    getCategoryTree()
      .then(data => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const bySlug = useMemo(() => flattenCategories(categories), [categories]);
  const roots = useMemo(() => sortByCount(categories.filter(category => category.level === 1 || !category.parentId)), [categories]);
  const normalizedQuery = normalize(query);

  const totals = useMemo(() => {
    const subcategoryCount = roots.reduce((sum, category) => sum + (category.children?.length ?? 0), 0);
    const productCount = roots.reduce((sum, category) => sum + (category.productCount ?? 0), 0);

    return {
      roots: roots.length,
      subcategories: subcategoryCount,
      products: productCount,
    };
  }, [roots]);

  const popularRoots = useMemo(() => roots.slice(0, 6), [roots]);

  const visibleRoots = useMemo(() => {
    if (!normalizedQuery) return roots;

    return roots.filter(root => {
      if (categoryMatches(root, normalizedQuery)) return true;
      return root.children?.some(child => categoryMatches(child, normalizedQuery));
    });
  }, [normalizedQuery, roots]);

  return (
    <main className={`container-site ${styles.page}`}>
      <nav className={styles.breadcrumb} aria-label="Хлебные крошки">
        <Link href="/">Главная</Link>
        <span>/</span>
        <span>Каталог</span>
      </nav>

      <section className={styles.header}>
        <div className={styles.headerCopy}>
          <div className="eyebrow">01 · Каталог</div>
          <h1>Каталог промышленного снабжения</h1>
          <p>
            Быстрый вход в категории, подкатегории и популярные направления для закупок,
            обслуживания производства и складского снабжения.
          </p>
        </div>

        <div className={styles.metrics} aria-label="Статистика каталога">
          <div>
            <strong>{formatCount(totals.roots)}</strong>
            <span>разделов</span>
          </div>
          <div>
            <strong>{formatCount(totals.subcategories)}</strong>
            <span>подкатегорий</span>
          </div>
          <div>
            <strong>{formatCount(totals.products)}</strong>
            <span>товаров в разделах</span>
          </div>
        </div>
      </section>

      <section className={styles.controlPanel} aria-label="Быстрая навигация по каталогу">
        <div className={styles.searchBox}>
          <label htmlFor="category-search">Найти категорию</label>
          <input
            id="category-search"
            className={`input ${styles.searchInput}`}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Например: перчатки, кабель, клапаны, подшипники"
          />
        </div>

        <div className={styles.quickGroup}>
          <div className={styles.groupTitle}>Часто ищут</div>
          <div className={styles.pillList}>
            {QUICK_LINKS.map(link => (
              <Link key={link.slug} href={categoryOrSearchHref(link.slug, bySlug, link.label)} className={styles.pill}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.layout}>
        <aside className={styles.aside} aria-label="Популярные направления и бренды">
          <section className={styles.asideSection}>
            <div className={styles.groupTitle}>Популярные разделы</div>
            <div className={styles.sideLinks}>
              {popularRoots.map(category => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <span>{category.name}</span>
                  <small>{formatCount(category.productCount)}</small>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.asideSection}>
            <div className={styles.groupTitle}>Популярные бренды</div>
            <div className={styles.brandList}>
              {BRAND_LINKS.map(brand => (
                <Link key={brand.name} href={brand.href}>
                  {brand.name}
                </Link>
              ))}
            </div>
          </section>

          <Link href="/products" className={styles.catalogCta}>
            <span>Все товары</span>
            <strong>Перейти в полный список →</strong>
          </Link>
        </aside>

        <section className={styles.catalogArea} aria-label="Все категории">
          <div className={styles.catalogHeader}>
            <div>
              <div className={styles.groupTitle}>Все категории</div>
              <p>{normalizedQuery ? `Найдено разделов: ${visibleRoots.length}` : 'Основные направления промышленного снабжения'}</p>
            </div>
            {normalizedQuery ? (
              <button type="button" className={styles.clearButton} onClick={() => setQuery('')}>
                Сбросить поиск
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className={styles.categoryGrid} aria-label="Загрузка категорий">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={`${styles.categoryCard} ${styles.skeleton}`} />
              ))}
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              Категории временно не загрузились. Обновите страницу или перейдите в общий список товаров.
              <Link href="/products">Открыть товары</Link>
            </div>
          ) : visibleRoots.length === 0 ? (
            <div className={styles.emptyState}>
              По этому запросу разделов не найдено.
              <button type="button" onClick={() => setQuery('')}>
                Показать все категории
              </button>
            </div>
          ) : (
            <div className={styles.categoryGrid}>
              {visibleRoots.map(root => {
                const matchedChildren = normalizedQuery
                  ? (root.children ?? []).filter(child => categoryMatches(child, normalizedQuery))
                  : [];
                const children = matchedChildren.length
                  ? sortByCount(matchedChildren).slice(0, 8)
                  : sortByCount(root.children ?? []).slice(0, 8);

                return (
                  <article key={root.id} className={styles.categoryCard}>
                    <Link href={`/categories/${root.slug}`} className={styles.categoryTitle}>
                      <span>{root.name}</span>
                      <small>{formatCount(root.productCount)} товаров</small>
                    </Link>

                    {children.length ? (
                      <div className={styles.childLinks}>
                        {children.map(child => (
                          <Link key={child.id} href={`/categories/${child.slug}`}>
                            <span>{child.name}</span>
                            <small>{formatCount(child.productCount)}</small>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noChildren}>Подкатегории будут добавлены после расширения таксономии.</p>
                    )}

                    <Link href={`/categories/${root.slug}`} className={styles.openLink}>
                      Открыть раздел →
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
