import { Link, useSearchParams } from 'react-router-dom';
import type { CatalogFilterOption } from './product-filters';

export const featuredBrands: CatalogFilterOption[] = [
  { label: 'Haskell', value: 'haskell' },
  { label: 'Grandha', value: 'grandha' },
  { label: 'Maxiline', value: 'maxiline' },
  { label: 'KNUT', value: 'knut' },
  { label: 'Bioma Care', value: 'bioma-care' },
  { label: 'Oh My!', value: 'oh-my' },
  { label: 'Senscience', value: 'senscience' },
];

export function BrandRail({ brands = featuredBrands }: { brands?: CatalogFilterOption[] }) {
  const [searchParams] = useSearchParams();
  const selectedBrand = searchParams.get('brand');

  return (
    <section aria-labelledby="brand-rail-title">
      <div className="brand-rail__heading"><h2 id="brand-rail-title" aria-label="Marcas em destaque">Compre por marca</h2></div>
      <div className="brand-rail">
        {brands.map((brand) => (
          <Link
            className={`brand-rail__item${selectedBrand === brand.value ? ' is-active' : ''}`}
            key={brand.value}
            to={`/loja?brand=${brand.value}`}
          >
            {brand.imagePath ? <span className="brand-rail__image"><img src={brand.imagePath} alt={brand.label} /></span> : null}
            <span>{brand.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
