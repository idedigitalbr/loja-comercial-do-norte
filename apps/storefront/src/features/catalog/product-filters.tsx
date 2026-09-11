import { useSearchParams } from 'react-router-dom';

const brands = [{ label: 'Haskell', value: 'haskell' }];
const categories = [{ label: 'Shampoo', value: 'shampoo' }];

export function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  function toggleFilter(key: 'brand' | 'category', value: string, checked: boolean) {
    const next = new URLSearchParams(searchParams);
    if (checked) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <aside aria-label="Filtros de produtos">
      <fieldset>
        <legend>Marca</legend>
        {brands.map((brand) => (
          <label key={brand.value}>
            <input
              type="checkbox"
              aria-label={brand.label}
              checked={searchParams.get('brand') === brand.value}
              onChange={(event) => toggleFilter('brand', brand.value, event.target.checked)}
            />
            {brand.label}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Categoria</legend>
        {categories.map((category) => (
          <label key={category.value}>
            <input
              type="checkbox"
              aria-label={category.label}
              checked={searchParams.get('category') === category.value}
              onChange={(event) => toggleFilter('category', category.value, event.target.checked)}
            />
            {category.label}
          </label>
        ))}
      </fieldset>
    </aside>
  );
}
