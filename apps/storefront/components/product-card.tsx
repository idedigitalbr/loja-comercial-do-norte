import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@/lib/format';
import { mediaUrl } from '@/lib/api';
import type { ApiProduct } from '@/lib/types';
import { AddToQuoteButton } from './add-to-quote-button';

/** Card de produto com preço de referência e CTA de cotação (nunca compra). */
export function ProductCard({ product }: { product: ApiProduct }) {
  // Prioriza a variante com desconto real para exibir o "de/por".
  const variant = product.variants.find(
    (item) => item.compareAtPriceCents && item.compareAtPriceCents > item.priceCents,
  ) ?? product.variants[0];
  const image = mediaUrl(product.images[0]?.path ?? null);
  const compareAt = variant?.compareAtPriceCents ?? null;
  const hasDiscount = Boolean(compareAt && variant && compareAt > variant.priceCents);
  const discountPercent = hasDiscount && compareAt && variant ? Math.round((1 - variant.priceCents / compareAt) * 100) : 0;
  const category = product.categories[0]?.category;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
      <Link className="relative block aspect-square overflow-hidden bg-surface-soft" href={`/produto/${product.slug}`}>
        {image ? (
          <Image
            alt={product.images[0]?.altText ?? product.name}
            className="size-full object-cover transition group-hover:scale-105"
            height={480}
            src={image}
            width={480}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-xs text-muted">Imagem em preparação</span>
        )}
        {hasDiscount ? (
          <span className="absolute left-2 top-2 rounded-pill bg-promo px-2 py-1 text-[11px] font-bold text-white">-{discountPercent}%</span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {category ? <p className="text-[11px] uppercase tracking-wide text-muted">{category.name}</p> : null}
        <Link className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand" href={`/produto/${product.slug}`}>
          {product.name}
        </Link>
        <div className="mt-auto">
          {variant ? (
            <div className="flex items-baseline gap-2">
              <strong className="text-lg font-extrabold text-brand">{formatMoney(variant.priceCents)}</strong>
              {hasDiscount && compareAt ? <span className="text-xs text-muted line-through">{formatMoney(compareAt)}</span> : null}
            </div>
          ) : (
            <p className="text-xs text-muted">Consulte disponibilidade</p>
          )}
          <p className="mt-1 text-[11px] text-muted">Preço de referência · sujeito a cotação</p>
          {variant ? (
            <div className="mt-3">
              <AddToQuoteButton
                item={{
                  variantId: variant.id,
                  productSlug: product.slug,
                  name: product.name,
                  sku: variant.sku,
                  imagePath: product.images[0]?.path ?? null,
                  unitPriceCents: variant.priceCents,
                  quantity: 1,
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
