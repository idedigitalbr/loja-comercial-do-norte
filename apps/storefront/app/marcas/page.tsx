import Link from 'next/link';
import type { Metadata } from 'next';
import { getBrands } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Marcas | Comercial do Norte',
  description: 'Marcas disponíveis no catálogo da Comercial do Norte.',
  alternates: { canonical: '/marcas' },
};

export default async function BrandsPage() {
  const brands = await getBrands();
  return (
    <div className="cn-container py-8">
      <h1 className="text-2xl font-extrabold text-ink">Marcas</h1>
      <p className="text-sm text-muted">Catálogo organizado por marca para facilitar sua cotação.</p>

      {brands.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {brands.map((brand) => (
            <Link
              className="rounded-card border border-line bg-surface p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-brand"
              href={`/marca/${brand.slug}`}
              key={brand.id}
            >
              <p className="text-sm font-bold text-ink">{brand.name}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-card border border-dashed border-line bg-surface p-6 text-sm text-muted">
          Nenhuma marca publicada até o momento.
        </p>
      )}
    </div>
  );
}
