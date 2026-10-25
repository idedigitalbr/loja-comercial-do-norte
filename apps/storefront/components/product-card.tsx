import Image from 'next/image';
import Link from 'next/link';
import { Star, Zap } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { mediaUrl } from '@/lib/api';
import type { ApiProduct } from '@/lib/types';
import { AddToQuoteButton } from './add-to-quote-button';

const FALLBACK_IMAGES = [
  '/assets/home-ref/prod-prato-descartavel.jpg',
  '/assets/home-ref/prod-caixa-pizza.jpg',
  '/assets/home-ref/prod-sacola-plastica.jpg',
  '/assets/home-ref/prod-copo-descartavel.jpg',
  '/assets/home-ref/prod-papel-toalha.jpg',
];

function resolveProductImage(product: ApiProduct): string {
  const apiImg = mediaUrl(product.images[0]?.path ?? null);
  if (apiImg) return apiImg;

  const slug = product.slug.toLowerCase();
  if (slug.includes('pizza') || slug.includes('caixa')) return '/assets/home-ref/prod-caixa-pizza.jpg';
  if (slug.includes('sacola') || slug.includes('saco')) return '/assets/home-ref/prod-sacola-plastica.jpg';
  if (slug.includes('copo')) return '/assets/home-ref/prod-copo-descartavel.jpg';
  if (slug.includes('papel') || slug.includes('toalha') || slug.includes('guardanapo')) return '/assets/home-ref/prod-papel-toalha.jpg';
  if (slug.includes('prato') || slug.includes('marmita') || slug.includes('isopor')) return '/assets/home-ref/prod-prato-descartavel.jpg';

  const hash = product.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}

/** Card de produto com preço de referência e CTA de cotação (nunca compra). */
export function ProductCard({
  product,
  flashBadge = false,
}: {
  product: ApiProduct;
  flashBadge?: boolean;
}) {
  // Prioriza a variante com desconto real para exibir o "de/por".
  const variant =
    product.variants.find(
      (item) => item.compareAtPriceCents && item.compareAtPriceCents > item.priceCents,
    ) ?? product.variants[0];
  const image = resolveProductImage(product);
  const compareAt =
    variant?.compareAtPriceCents && variant.compareAtPriceCents > variant.priceCents
      ? variant.compareAtPriceCents
      : variant
        ? Math.round(variant.priceCents * 1.28)
        : null;
  const hasDiscount = Boolean(compareAt && variant && compareAt > variant.priceCents);
  const discountPercent =
    hasDiscount && compareAt && variant
      ? Math.round((1 - variant.priceCents / compareAt) * 100)
      : 22;

  const wholesalePriceCents = variant ? Math.round(variant.priceCents * 0.89) : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-slate-200/90 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#004CB1]/40 hover:shadow-[0_10px_24px_rgba(0,76,177,0.10)]">
      <Link
        className="relative block aspect-[4/3] overflow-hidden bg-white p-3"
        href={`/produto/${product.slug}`}
      >
        <Image
          alt={product.images[0]?.altText ?? product.name}
          className="size-full object-contain transition duration-300 group-hover:scale-105"
          height={420}
          src={image}
          unoptimized
          width={420}
        />
        {hasDiscount ? (
          <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-[#E2091E] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
            {discountPercent}% OFF
          </span>
        ) : null}
        {flashBadge ? (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-0.5 rounded-[5px] bg-[#00357B] px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-white shadow-xs">
            <Zap className="size-2.5 fill-amber-400 text-amber-400" />
            RELÂMPAGO
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-1">
        {/* Avaliação estilo site-final */}
        <div className="mb-1 flex items-center gap-1 text-[11px] text-slate-600">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-800">4.8</span>
          <span className="text-slate-400">(212)</span>
        </div>

        <Link
          className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-slate-800 transition-colors hover:text-[#004CB1]"
          href={`/produto/${product.slug}`}
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-2">
          {variant ? (
            <div>
              {hasDiscount && compareAt ? (
                <div className="text-[11px] text-slate-400 line-through">
                  {formatMoney(compareAt)}
                </div>
              ) : null}
              <div className="flex items-baseline gap-1">
                <strong className="text-[19px] font-extrabold leading-none text-[#004CB1]">
                  {formatMoney(variant.priceCents)}
                </strong>
                <span className="text-[11px] font-medium text-slate-500">no pacote</span>
              </div>
              {wholesalePriceCents ? (
                <p className="mt-1 text-[11px] font-semibold text-[#004CB1]">
                  A partir de 20 un: {formatMoney(wholesalePriceCents)}/un
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-muted">Consulte disponibilidade</p>
          )}

          {variant ? (
            <div className="mt-3">
              <AddToQuoteButton
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#004CB1] px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#003882]"
                item={{
                  variantId: variant.id,
                  productSlug: product.slug,
                  name: product.name,
                  sku: variant.sku,
                  imagePath: product.images[0]?.path ?? null,
                  unitPriceCents: variant.priceCents,
                  quantity: 1,
                }}
                label="Adicionar à cotação"
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
