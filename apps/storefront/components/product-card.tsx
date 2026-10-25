import Image from 'next/image';
import Link from 'next/link';
import { Star, Zap } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { mediaUrl } from '@/lib/api';
import type { ApiProduct } from '@/lib/types';
import { AddToQuoteButton } from './add-to-quote-button';

const FALLBACK_IMAGES = [
  '/assets/home-ref/prod-copo-descartavel.jpg',
  '/assets/home-ref/prod-prato-descartavel.jpg',
  '/assets/home-ref/prod-sacola-plastica.jpg',
  '/assets/home-ref/prod-papel-toalha.jpg',
  '/assets/home-ref/prod-caixa-pizza.jpg',
];

function resolveProductImage(product: ApiProduct): string {
  const rawPath = product.images[0]?.path ?? null;
  if (rawPath && rawPath.startsWith('/assets/')) return rawPath;
  const apiImg = mediaUrl(rawPath);
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

/** Card de produto com fidelidade 1:1 ao site-final.jpg e CTA de cotação (Fase 1). */
export function ProductCard({
  product,
  flashBadge = false,
}: {
  product: ApiProduct;
  flashBadge?: boolean;
}) {
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
  const footerNote =
    product.description && product.description.length <= 65
      ? product.description
      : wholesalePriceCents
        ? `A partir de 20 pct: ${formatMoney(wholesalePriceCents)} no atacado`
        : 'Condição especial para atacado e comércio';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[14px] border border-slate-200/90 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#004CB1]/40 hover:shadow-[0_10px_24px_rgba(0,76,177,0.10)]">
      <Link
        className="relative block aspect-[4/3] overflow-hidden bg-white px-4 pb-3 pt-10"
        href={`/produto/${product.slug}`}
      >
        {/* Badges empilhados no canto superior esquerdo (idêntico ao site-final.jpg) */}
        <div className="absolute left-3 top-2.5 z-10 flex flex-col items-start gap-1">
          {hasDiscount ? (
            <span className="rounded-full bg-[#E2091E] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          ) : null}
          {flashBadge ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1E3A6E] px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-white shadow-xs">
              <Zap className="size-2.5 fill-white text-white" />
              RELÂMPAGO
            </span>
          ) : null}
        </div>

        <Image
          alt={product.images[0]?.altText ?? product.name}
          className="size-full object-contain transition duration-300 group-hover:scale-105"
          height={250}
          src={image}
          unoptimized
          width={360}
        />
      </Link>

      <div className="flex flex-1 flex-col border-t border-slate-100 px-3.5 pb-3.5 pt-3">
        <Link
          className="line-clamp-2 min-h-[2.4rem] text-[12.5px] font-bold leading-snug text-slate-800 transition-colors hover:text-[#004CB1]"
          href={`/produto/${product.slug}`}
        >
          {product.name}
        </Link>

        {/* 5 Estrelas abaixo do título (idêntico ao site-final.jpg) */}
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-0.5 text-amber-400">
            {[0, 1, 2, 3, 4].map((s) => (
              <Star className="size-3 fill-amber-400 text-amber-400" key={s} />
            ))}
          </div>
          <span className="font-semibold text-slate-600">4.8 (212)</span>
        </div>

        <div className="mt-auto pt-2">
          {variant ? (
            <div>
              {hasDiscount && compareAt ? (
                <div className="text-[11px] text-slate-400 line-through">
                  {formatMoney(compareAt)}
                </div>
              ) : null}
              <div className="mt-0.5 flex items-baseline gap-1">
                <strong className="text-[18px] font-extrabold leading-none text-[#163264]">
                  {formatMoney(variant.priceCents)}
                </strong>
                <span className="text-[11px] font-normal text-slate-500">no pacote</span>
              </div>
              <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-snug text-slate-500">
                {footerNote}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted">Consulte disponibilidade</p>
          )}

          {variant ? (
            <div className="mt-2.5">
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
