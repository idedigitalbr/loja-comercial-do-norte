import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WebEmptyState } from '@commerce/ui/web';
import { ProductCard } from '@/components/product-card';
import { getCategories, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  return {
    title: `${category?.name ?? 'Categoria'} | Comercial do Norte`,
    description: category ? `Produtos de ${category.name} para cotação na Comercial do Norte.` : undefined,
    alternates: { canonical: `/categoria/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts({ category: slug })]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  return (
    <div className="cn-container py-8">
      <nav aria-label="Você está aqui" className="text-xs text-muted">
        <Link className="hover:text-brand" href="/">Início</Link>
        <span aria-hidden> / </span>
        <Link className="hover:text-brand" href="/loja">Catálogo</Link>
        <span aria-hidden> / </span>
        <span className="text-ink">{category.name}</span>
      </nav>

      <header className="mt-3">
        <h1 className="text-2xl font-extrabold text-ink">{category.name}</h1>
        <p className="text-sm text-muted">{products.length} produto(s) disponível(is) para cotação.</p>
      </header>

      {category.children?.length ? (
        <nav aria-label="Subcategorias" className="mt-4 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link
              className="rounded-pill border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
              href={`/categoria/${child.slug}`}
              key={child.id}
            >
              {child.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {products.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <WebEmptyState
          action={
            <Link className="inline-block rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover" href="/loja">
              Ver catálogo
            </Link>
          }
          className="mt-8"
          description="Explore outras categorias ou solicite atendimento pelo WhatsApp."
          title="Ainda não há produtos publicados nesta categoria."
        />
      )}
    </div>
  );
}
