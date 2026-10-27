import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WebEmptyState } from '@commerce/ui/web';
import { ProductCard } from '@/components/product-card';
import { getProducts, getTags } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const tags = await getTags();
  const tag = tags.find((item) => item.slug === slug);
  return {
    title: `Tag: #${tag?.name ?? slug} | Comercial do Norte`,
    description: `Produtos com a etiqueta #${tag?.name ?? slug} no Comercial do Norte.`,
    alternates: { canonical: `/tag/${slug}` },
  };
}

export default async function TagPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [tags, products] = await Promise.all([
    getTags(),
    getProducts({ tag: slug }),
  ]);
  const tag = tags.find((item) => item.slug === slug);
  if (!tag) notFound();

  return (
    <div className="cn-container py-8">
      <nav aria-label="Você está aqui" className="text-xs text-muted">
        <Link className="hover:text-brand" href="/">Início</Link>
        <span aria-hidden> / </span>
        <Link className="hover:text-brand" href="/loja">Catálogo</Link>
        <span aria-hidden> / </span>
        <span className="text-muted">Tags</span>
        <span aria-hidden> / </span>
        <span className="font-semibold text-ink">#{tag.name}</span>
      </nav>

      <header className="mt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand">Tag do Produto</span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-ink">#{tag.name}</h1>
        <p className="mt-1 text-sm text-muted">{products.length} produto(s) encontrado(s) com esta etiqueta.</p>
      </header>

      {/* Grid de Produtos */}
      {products.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 items-start">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <WebEmptyState
          action={
            <Link className="inline-block rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover" href="/loja">
              Ver catálogo completo
            </Link>
          }
          className="mt-8"
          description="Nenhum produto com esta tag disponível no momento."
          title={`Sem produtos com a tag #${tag.name}`}
        />
      )}
    </div>
  );
}
