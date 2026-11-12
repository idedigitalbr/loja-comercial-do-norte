import Image from 'next/image';
import Link from 'next/link';
import {
  Barcode,
  Box,
  Droplets,
  Layers,
  Palette,
  Ruler,
  ShoppingBag,
  Tag,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { resolveProductImage } from '@/lib/product-placeholders';
import type { ApiProduct, ApiVariant } from '@/lib/types';
import { FavoriteButton } from './favorite-button';
import { ProductCardActions } from './product-card-actions';

type SpecRow = {
  key: string;
  label: string;
  value: string;
  Icon: LucideIcon;
};

function resolveDisplayColor(product: ApiProduct, variant?: ApiVariant): string | null {
  const distinctColors = Array.from(
    new Set(
      (product.variants ?? [])
        .map((item) => item.color?.trim())
        .filter((color): color is string => Boolean(color)),
    ),
  );
  if (distinctColors.length > 1) return `${distinctColors.length} cores`;
  if (distinctColors.length === 1) return distinctColors[0];
  return variant?.color?.trim() || null;
}

function resolveDisplaySizeOrModel(
  productName: string,
  variant?: ApiVariant,
): { label: string; value: string } | null {
  const rawSize = variant?.sizeOrModel?.trim();
  if (rawSize) {
    // Evita exibir letras P/M/G capturadas por engano de códigos como P-65M, M-60 ou G-312SF.
    const isSingleLetterSize = /^(PP|P|M|G|GG|XG|EG)$/i.test(rawSize);
    const isApparelOrGlove = /\b(luva|avental|touca|bota|cal[çc]a|camisa|jaleco|sapato|capa)\b/i.test(
      productName,
    );
    if (!isSingleLetterSize || isApparelOrGlove) {
      return { label: 'Tamanho/Modelo', value: rawSize };
    }
  }

  const dimensions = variant?.dimensionsRaw?.trim();
  if (dimensions) {
    return { label: 'Medidas', value: dimensions };
  }

  const manufacturerRef = variant?.manufacturerRef?.trim();
  if (manufacturerRef) {
    return { label: 'Modelo', value: manufacturerRef };
  }

  return null;
}

function buildProductSpecRows(product: ApiProduct, variant?: ApiVariant): SpecRow[] {
  const rows: SpecRow[] = [];

  const packaging = variant?.packagingRaw?.trim();
  if (packaging) {
    rows.push({ key: 'packaging', label: 'Quantidade', value: packaging, Icon: Layers });
  }

  const color = resolveDisplayColor(product, variant);
  if (color) {
    rows.push({ key: 'color', label: 'Cor', value: color, Icon: Palette });
  }

  const sizeOrModel = resolveDisplaySizeOrModel(product.name, variant);
  if (sizeOrModel) {
    rows.push({
      key: 'size',
      label: sizeOrModel.label,
      value: sizeOrModel.value,
      Icon: sizeOrModel.label === 'Modelo' ? Tag : Ruler,
    });
  }

  const capacity = variant?.capacityOrVolume?.trim();
  if (rows.length < 3 && capacity) {
    rows.push({ key: 'capacity', label: 'Capacidade', value: capacity, Icon: Droplets });
  }

  const material = variant?.material?.trim();
  if (rows.length < 3 && material) {
    rows.push({ key: 'material', label: 'Material', value: material, Icon: Box });
  }

  const netWeight = variant?.reportedNetWeight?.trim();
  if (rows.length < 3 && netWeight) {
    rows.push({ key: 'weight', label: 'Peso', value: netWeight, Icon: Box });
  }

  const sku = variant?.sku?.trim();
  if (rows.length < 2 && sku) {
    rows.push({ key: 'sku', label: 'SKU', value: sku, Icon: Barcode });
  }

  return rows.slice(0, 3);
}

/** Card de produto do catálogo com nome, categoria | marca, descrição e especificações técnicas */
export function ProductCard({
  product,
  flashBadge = false,
}: {
  product: ApiProduct;
  flashBadge?: boolean;
}) {
  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0] ?? null;
  const variant =
    product.variants.find(
      (item) => item.priceCents !== null && item.compareAtPriceCents && item.compareAtPriceCents > item.priceCents,
    ) ?? product.variants[0];
  const priceCents = variant?.priceCents ?? null;
  const hasPrice = priceCents !== null && priceCents > 0;
  const image = resolveProductImage(product);
  const compareAt =
    hasPrice && variant?.compareAtPriceCents && variant.compareAtPriceCents > (priceCents as number)
      ? variant.compareAtPriceCents
      : null;
  const hasDiscount = Boolean(hasPrice && compareAt && compareAt > (priceCents as number));
  const discountPercent =
    hasDiscount && compareAt && hasPrice
      ? Math.round((1 - (priceCents as number) / compareAt) * 100)
      : 0;

  const categoryName = product.categories?.[0]?.category?.name?.trim() || null;
  const brandName = product.brand?.name?.trim() || null;
  const descriptionText = product.description?.trim() || null;
  const specRows = buildProductSpecRows(product, variant);
  const hasActions = Boolean(variant);

  return (
    <article
      className={`group relative flex h-full w-full min-w-0 flex-col rounded-[14px] border border-slate-200/90 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:z-40 hover:-translate-y-14 sm:hover:-translate-y-[70px] hover:scale-[1.025] sm:hover:scale-[1.03] hover:border-[#004CB1]/40 hover:shadow-[0_22px_45px_rgba(0,76,177,0.20)] focus-within:z-40 focus-within:border-[#004CB1]/40 ${
        hasActions
          ? 'hover:rounded-b-none hover:border-b-transparent focus-within:rounded-b-none focus-within:border-b-transparent'
          : ''
      }`}
    >
      <Link
        className="relative block aspect-[4/3] overflow-hidden rounded-t-[14px] bg-white px-2.5 pb-2 pt-9 sm:px-4 sm:pb-3 sm:pt-10"
        href={`/produto/${product.slug}`}
      >
        {/* Botão de Favoritar no Canto Superior Direito */}
        <div className="absolute right-2 top-2 z-20 sm:right-2.5 sm:top-2.5">
          <FavoriteButton
            item={{
              id: product.id,
              variantId: variant?.id,
              productSlug: product.slug,
              name: product.name,
              sku: variant?.sku,
              imagePath: primaryImage?.path ?? image,
              unitPriceCents: hasPrice ? priceCents : null,
              compareAtPriceCents: compareAt,
            }}
          />
        </div>

        {/* Badges empilhados no canto superior esquerdo */}
        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1 sm:left-3 sm:top-2.5">
          {hasDiscount ? (
            <span className="rounded-full bg-[#E2091E] px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(226,9,30,0.35)] sm:px-2.5 sm:text-[10px]">
              {discountPercent}% OFF
            </span>
          ) : null}
          {flashBadge ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1E3A6E] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-xs sm:px-2.5 sm:text-[9.5px]">
              <Zap className="size-2.5 fill-white text-white" />
              RELÂMPAGO
            </span>
          ) : null}
        </div>

        <Image
          alt={`${product.name} (Imagem ilustrativa)`}
          className="size-full object-contain p-1.5 sm:p-2 transition duration-300 group-hover:scale-105"
          height={250}
          src={image}
          unoptimized
          width={360}
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between border-t border-slate-100 px-2.5 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3">
        <div>
          <Link
            className="line-clamp-2 min-h-[2.3rem] text-[12.5px] font-bold leading-snug text-slate-900 transition-colors hover:text-[#004CB1] sm:min-h-[2.45rem] sm:text-[13px]"
            href={`/produto/${product.slug}`}
          >
            {product.name}
          </Link>

          {categoryName || brandName ? (
            <div className="mt-1.5 flex items-center">
              <span
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:text-[10.5px]"
                title={[categoryName, brandName].filter(Boolean).join(' | ')}
              >
                <ShoppingBag aria-hidden className="size-2.5 shrink-0 text-slate-500 sm:size-3" />
                {categoryName ? <span className="truncate">{categoryName}</span> : null}
                {categoryName && brandName ? (
                  <span aria-hidden className="shrink-0 text-slate-400">
                    |
                  </span>
                ) : null}
                {brandName ? (
                  <span className="max-w-[48%] shrink-0 truncate font-semibold text-slate-700">
                    {brandName}
                  </span>
                ) : null}
              </span>
            </div>
          ) : null}

          {descriptionText ? (
            <p className="mt-2 line-clamp-3 min-h-[2.85rem] text-[11px] leading-snug text-slate-500 sm:min-h-[3.1rem] sm:text-[11.5px]">
              {descriptionText}
            </p>
          ) : null}
        </div>

        <div className="mt-2.5">
          {hasPrice ? (
            <div className="mb-2">
              {hasDiscount && compareAt ? (
                <div className="text-[10.5px] text-slate-400 line-through sm:text-[11px]">
                  {formatMoney(compareAt)}
                </div>
              ) : null}
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                <strong className="text-[16px] font-extrabold leading-none text-[#163264] sm:text-[19px]">
                  {formatMoney(priceCents as number)}
                </strong>
                <span className="text-[10px] font-normal text-slate-500 sm:text-[11px]">
                  no pacote
                </span>
              </div>
            </div>
          ) : null}

          {specRows.length > 0 ? (
            <dl className="divide-y divide-slate-100 border-t border-slate-100 text-[10.5px] sm:text-[11px]">
              {specRows.map(({ key, label, value, Icon }) => (
                <div className="flex items-center justify-between gap-2 py-1.5" key={key}>
                  <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-slate-700">
                    <Icon aria-hidden className="size-3.5 shrink-0 text-[#4F6D9A]" />
                    <span>{label}:</span>
                  </dt>
                  <dd
                    className="min-w-0 truncate text-right font-medium text-slate-500"
                    title={value}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : !variant ? (
            <p className="border-t border-slate-100 pt-2 text-[11px] text-slate-500">
              Consulte disponibilidade
            </p>
          ) : null}
        </div>
      </div>

      {/* Botões revelados apenas no hover em painel flutuante absoluto (não expande o container pai nem causa layout shift nas outras seções) */}
      {variant ? (
        <div className="pointer-events-none absolute left-[-1px] right-[-1px] top-[calc(100%-1px)] z-40 opacity-0 translate-y-1 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 rounded-b-[14px] border-x border-b border-[#004CB1]/40 bg-white px-3.5 pb-3 pt-1 shadow-[0_22px_45px_rgba(0,76,177,0.20)]">
          <ProductCardActions
            item={{
              variantId: variant.id,
              productSlug: product.slug,
              name: product.name,
              sku: variant.sku,
              imagePath: primaryImage?.path ?? image,
              unitPriceCents: hasPrice ? priceCents : null,
              quantity: 1,
            }}
          />
        </div>
      ) : null}
    </article>
  );
}
