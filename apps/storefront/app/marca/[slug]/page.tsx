import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { getBrands, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const brands = await getBrands();
  const brand = brands.find((item) => item.slug === slug);
  return {
    title: `${brand?.name ?? 'Marca'} | Comercial do Norte`,
    alternates: { canonical: `/marca/${slug}` },
  };
}

export default async function BrandPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [brands, products] = await Promise.all([getBrands(), getProducts({ brand: slug })]);
  const brand = brands.find((item) => item.slug === slug);
  if (!brand) notFound();

  return (
    <div className="cn-container py-8">
      <nav aria-label="Você está aqui" className="text-xs text-muted">
        <Link className="hover:text-brand" href="/">Início</Link>
        <span aria-hidden> / </span>
        <Link className="hover:text-brand" href="/marcas">Marcas</Link>
        <span aria-hidden> / </span>
        <span className="text-ink">{brand.name}</span>
      </nav>

      <header className="mt-3">
        <h1 className="text-2xl font-extrabold text-ink">{brand.name}</h1>
        <p className="text-sm text-muted">{products.length} produto(s) desta marca.</p>
      </header>

      {products.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <p className="mt-8 rounded-card border border-dashed border-line bg-surface p-6 text-sm text-muted">
          Nenhum produto publicado desta marca.
        </p>
      )}
    </div>
  );
}
