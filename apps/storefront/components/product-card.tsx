import Image from 'next/image';
import Link from 'next/link';
import { Star, Zap } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';
import type { ApiProduct } from '@/lib/types';
import { FavoriteButton } from './favorite-button';
import { ProductCardActions } from './product-card-actions';

/** Card de produto com fidelidade 1:1 ao design de referência e botões revelados no hover */
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

  const hasActions = Boolean(variant);

  return (
    <article
      className={`group relative flex w-full self-start flex-col rounded-[14px] border border-slate-200/90 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:z-40 hover:-translate-y-7 sm:hover:-translate-y-8 hover:scale-[1.025] sm:hover:scale-[1.03] hover:border-[#004CB1]/40 hover:shadow-[0_20px_40px_rgba(0,76,177,0.18)] focus-within:z-40 focus-within:border-[#004CB1]/40 ${
        hasActions
          ? 'hover:rounded-b-none hover:border-b-transparent focus-within:rounded-b-none focus-within:border-b-transparent'
          : ''
      }`}
    >
      <Link
        className="relative block aspect-[4/3] overflow-hidden rounded-t-[14px] bg-white px-4 pb-3 pt-10"
        href={`/produto/${product.slug}`}
      >
        {/* Botão de Favoritar no Canto Superior Direito */}
        <div className="absolute right-2.5 top-2.5 z-20">
          <FavoriteButton
            item={{
              id: product.id,
              variantId: variant?.id,
              productSlug: product.slug,
              name: product.name,
              sku: variant?.sku,
              imagePath: image,
              unitPriceCents: variant?.priceCents ?? 0,
              compareAtPriceCents: compareAt,
            }}
          />
        </div>

        {/* Badges empilhados no canto superior esquerdo */}
        <div className="absolute left-3 top-2.5 z-10 flex flex-col items-start gap-1">
          {hasDiscount ? (
            <span className="rounded-full bg-[#E2091E] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(226,9,30,0.35)]">
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
          alt={`${product.name} (Imagem ilustrativa)`}
          className="size-full object-contain p-2 transition duration-300 group-hover:scale-105"
          height={250}
          src={image}
          unoptimized
          width={360}
        />
      </Link>

      <div className="flex flex-col border-t border-slate-100 px-3.5 pb-3.5 pt-3">
        <Link
          className="line-clamp-2 min-h-[2.4rem] text-[12.5px] font-bold leading-snug text-slate-800 transition-colors hover:text-[#004CB1]"
          href={`/produto/${product.slug}`}
        >
          {product.name}
        </Link>

        {/* 5 Estrelas abaixo do título */}
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-0.5 text-amber-400">
            {[0, 1, 2, 3, 4].map((s) => (
              <Star className="size-3 fill-amber-400 text-amber-400" key={s} />
            ))}
          </div>
          <span className="font-semibold text-slate-600">4.7 (129)</span>
        </div>

        {/* Preço e nota de atacado conectados às estrelas sem vazio */}
        <div className="mt-2.5">
          {variant ? (
            <div>
              {hasDiscount && compareAt ? (
                <div className="text-[11px] text-slate-400 line-through">
                  {formatMoney(compareAt)}
                </div>
              ) : null}
              <div className="mt-0.5 flex items-baseline gap-1">
                <strong className="text-[19px] font-extrabold leading-none text-[#163264]">
                  {formatMoney(variant.priceCents)}
                </strong>
                <span className="text-[11px] font-normal text-slate-500">no pacote</span>
              </div>
              <p className="mt-1.5 min-h-[2rem] line-clamp-2 text-[11px] leading-snug text-slate-500">
                {footerNote}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted">Consulte disponibilidade</p>
          )}
        </div>
      </div>

      {/* Botões revelados apenas no hover em painel flutuante absoluto (não expande o container pai nem causa layout shift nas outras seções) */}
      {variant ? (
        <div className="pointer-events-none absolute left-[-1px] right-[-1px] top-[calc(100%-1px)] z-40 opacity-0 translate-y-1 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 rounded-b-[14px] border-x border-b border-[#004CB1]/40 bg-white px-3.5 pb-3.5 pt-1 shadow-[0_20px_40px_rgba(0,76,177,0.18)]">
          <ProductCardActions
            item={{
              variantId: variant.id,
              productSlug: product.slug,
              name: product.name,
              sku: variant.sku,
              imagePath: image,
              unitPriceCents: variant.priceCents,
              quantity: 1,
            }}
          />
        </div>
      ) : null}
    </article>
  );
}
