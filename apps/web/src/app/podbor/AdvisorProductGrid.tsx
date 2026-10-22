'use client';

import { ProductCard } from '@/components/molecules/ProductCard';
import { flyToCart } from '@/components/molecules/CartFly';
import type { Product } from '@/lib/api/products';

/**
 * Client grid that renders advisor result products exactly like the category
 * page (grid-3 + ProductCard, with fly-to-cart on add).
 */
export function AdvisorProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid-3" style={{ gap: 16 }}>
      {products.map((p) => {
        const st = p.stock?.reduce((s: number, w: any) => s + w.quantity - w.reserved, 0) ?? 0;
        return (
          <ProductCard
            key={p.id}
            id={p.id}
            title={p.title}
            variantId={p.variantId}
            brandName={p.brand?.name}
            price={Number(p.price)}
            salePrice={p.salePrice ? Number(p.salePrice) : null}
            imageUrl={p.imageUrl}
            availability={p.availability}
            stockTotal={st}
            mpn={p.mpn}
            description={p.description}
            descriptionRu={p.descriptionRu}
            attributes={p.attributes}
            specifications={p.specifications}
            documents={p.documents}
            createdAt={p.createdAt}
            variant="grid"
            onAddToCart={() => { if (p.imageUrl) flyToCart(document.activeElement as HTMLElement, p.imageUrl); }}
          />
        );
      })}
    </div>
  );
}
