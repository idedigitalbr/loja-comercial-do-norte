import { Link, useSearchParams } from 'react-router-dom';
import type { CatalogFilterOption } from './product-filters';

export const featuredBrands: CatalogFilterOption[] = [
  { label: 'Haskell', value: 'haskell', imagePath: '/brands/haskell.webp' },
  { label: 'Grandha', value: 'grandha', imagePath: '/brands/grandha.webp' },
  { label: 'Maxiline', value: 'maxiline', imagePath: '/brands/maxiline.webp' },
  { label: 'KNUT', value: 'knut', imagePath: '/brands/knut.webp' },
  { label: 'Bioma Care', value: 'bioma-care', imagePath: '/brands/bioma-care.webp' },
  { label: 'Oh My', value: 'oh-my', imagePath: '/brands/oh-my.webp' },
  { label: 'Senscience', value: 'senscience', imagePath: '/brands/senscience.webp' },
];

export function BrandRail({ brands = featuredBrands }: { brands?: CatalogFilterOption[] }) {
  const [searchParams] = useSearchParams();
  const selectedBrand = searchParams.get('brand');
  const publishedBrands = featuredBrands.filter((featured) => brands.some((brand) => brand.value === featured.value));

  return (
    <section aria-label="Compre por marca">
      <div className="brand-rail">
        {publishedBrands.map((brand) => (
          <Link
            className={`brand-rail__item${selectedBrand === brand.value ? ' is-active' : ''}`}
            key={brand.value}
            to={`/loja?brand=${brand.value}`}
            aria-label={brand.label}
          >
            {brand.imagePath ? <span className="brand-rail__image"><img src={brand.imagePath} alt={brand.label} /></span> : null}
            <span className="sr-only">{brand.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
