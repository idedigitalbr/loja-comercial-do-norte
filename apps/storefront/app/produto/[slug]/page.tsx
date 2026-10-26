import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Package, Ruler, Truck } from 'lucide-react';
import { WebBadge, WebCard } from '@commerce/ui/web';
import { AddToQuoteButton } from '@/components/add-to-quote-button';
import { ProductCard } from '@/components/product-card';
import { getProduct, getProducts, mediaUrl } from '@/lib/api';
import { resolveProductImage } from '@/lib/product-placeholders';
import { formatMoney } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Produto não encontrado | Comercial do Norte', robots: { index: false, follow: false } };
  const description = product.description ?? `Cotação de ${product.name} na Comercial do Norte.`;
  return {
    title: `${product.name} | Comercial do Norte`,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: [resolveProductImage(product)],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const variant = product.variants[0];
  const image = resolveProductImage(product);
  const category = product.categories[0]?.category;
  const compareAt = variant?.compareAtPriceCents ?? null;
  const hasDiscount = Boolean(compareAt && variant && compareAt > variant.priceCents);
  const discountPct =
    hasDiscount && compareAt && variant
      ? Math.round(((compareAt - variant.priceCents) / compareAt) * 100)
      : 0;

  const relatedRaw = category ? await getProducts({ category: category.slug }) : await getProducts();
  const related = relatedRaw.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <div className="cn-container py-8">
      <nav aria-label="Você está aqui" className="text-xs text-muted">
        <Link className="hover:text-brand" href="/">Início</Link>
        <span aria-hidden> / </span>
        <Link className="hover:text-brand" href="/loja">Catálogo</Link>
        {category ? <><span aria-hidden> / </span><Link className="hover:text-brand" href={`/categoria/${category.slug}`}>{category.name}</Link></> : null}
        <span aria-hidden> / </span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="flex aspect-square items-center justify-center bg-white p-6">
            <Image
              alt={`${product.name} (Imagem ilustrativa)`}
              className="size-full object-contain transition duration-300"
              height={960}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              src={image}
              unoptimized
              width={960}
            />
          </div>
          <p className="border-t border-line/60 bg-surface-soft/60 py-2 text-center text-xs text-muted">
            Imagem ilustrativa de demonstração
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.brand ? <p className="text-xs uppercase tracking-wide text-muted">{product.brand.name}</p> : null}
            {hasDiscount ? <WebBadge tone="promo">-{discountPct}% OFF</WebBadge> : null}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">{product.name}</h1>
          {variant ? <p className="mt-1 text-xs text-muted">SKU {variant.sku}</p> : null}

          <WebCard className="mt-4">
            {variant ? (
              <>
                <div className="flex items-baseline gap-3">
                  <strong className="text-3xl font-extrabold text-brand">{formatMoney(variant.priceCents)}</strong>
                  {hasDiscount && compareAt ? (
                    <span className="text-sm text-muted line-through">{formatMoney(compareAt)}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted">Preço de referência para cotação. A equipe comercial confirma valor e disponibilidade.</p>
                <div className="mt-4">
                  <AddToQuoteButton
                    item={{
                      variantId: variant.id,
                      productSlug: product.slug,
                      name: product.name,
                      sku: variant.sku,
                      imagePath: image,
                      unitPriceCents: variant.priceCents,
                      quantity: 1,
                    }}
                    label="Adicionar à cotação"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Produto sem variante disponível para cotação.</p>
            )}
          </WebCard>

          {product.description ? (
            <section className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Descrição</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-body">{product.description}</p>
            </section>
          ) : null}

          <section className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-card border border-line bg-surface p-3 text-sm">
              <Package aria-hidden className="mt-0.5 size-4 text-brand" />
              <div>
                <p className="font-semibold text-ink">Venda por cotação</p>
                <p className="text-xs text-muted">Atacado e varejo, sem pagamento online.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-card border border-line bg-surface p-3 text-sm">
              <Truck aria-hidden className="mt-0.5 size-4 text-brand" />
              <div>
                <p className="font-semibold text-ink">Entrega e retirada</p>
                <p className="text-xs text-muted">Combinadas com a equipe comercial.</p>
              </div>
            </div>
            {variant?.weightGrams ? (
              <div className="flex items-start gap-2 rounded-card border border-line bg-surface p-3 text-sm">
                <Ruler aria-hidden className="mt-0.5 size-4 text-brand" />
                <div>
                  <p className="font-semibold text-ink">Dados do item</p>
                  <p className="text-xs text-muted">
                    {variant.weightGrams} g
                    {variant.widthMm && variant.heightMm && variant.lengthMm
                      ? ` · ${variant.widthMm}×${variant.heightMm}×${variant.lengthMm} mm`
                      : ''}
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {related.length > 0 ? (
        <section aria-label="Produtos relacionados" className="mt-12 border-t border-line pt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-ink">Produtos relacionados</h2>
            <Link className="text-xs font-bold text-brand hover:underline" href={category ? `/categoria/${category.slug}` : '/loja'}>
              Ver mais →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
