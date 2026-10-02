import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@commerce/ui';

export type CatalogFilterOption = { id?: string; label: string; value: string; parentId?: string | null; depth?: number; imagePath?: string | null };
export const fallbackBrands: CatalogFilterOption[] = [{ label: 'Haskell', value: 'haskell', depth: 0 }];
export const fallbackCategories: CatalogFilterOption[] = [{ label: 'Shampoo', value: 'shampoo', depth: 0 }];

type BrandFilterGroup = { root: CatalogFilterOption; children: CatalogFilterOption[] };
export type CatalogScope = { key: 'brand' | 'category'; value: string };

function groupBrandOptions(options: CatalogFilterOption[]): BrandFilterGroup[] {
  const groups: BrandFilterGroup[] = [];
  for (const option of options) {
    if ((option.depth ?? 0) === 0 || groups.length === 0) {
      groups.push({ root: option, children: [] });
    } else {
      groups[groups.length - 1].children.push(option);
    }
  }
  return groups;
}

export function ProductFilters({ brands = fallbackBrands, categories = fallbackCategories, scope }: { brands?: CatalogFilterOption[]; categories?: CatalogFilterOption[]; scope?: CatalogScope }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const brandGroups = groupBrandOptions(brands);
  const [collapsedBrands, setCollapsedBrands] = useState<Set<string>>(() => new Set(brandGroups.filter(({ children }) => children.length).map(({ root }) => root.value)));
  const previousCollapsibleBrands = useRef(new Set(brandGroups.filter(({ children }) => children.length).map(({ root }) => root.value)));
  useEffect(() => {
    const collapsibleBrands = new Set(brandGroups.filter(({ children }) => children.length).map(({ root }) => root.value));
    setCollapsedBrands((current) => {
      const next = new Set([...current].filter((value) => collapsibleBrands.has(value)));
      for (const value of collapsibleBrands) {
        if (!previousCollapsibleBrands.current.has(value)) next.add(value);
      }
      return next;
    });
    previousCollapsibleBrands.current = collapsibleBrands;
  }, [brands]);
  function toggleFilter(key: 'brand' | 'category', value: string, checked: boolean) {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (checked) next.set(key, value);
    else next.delete(key);
    if (!checked && scope?.key === key && scope.value === value && !searchParams.has(key)) {
      navigate(`/loja${next.size ? `?${next.toString()}` : ''}`);
      return;
    }
    setSearchParams(next);
  }

  function isSelected(key: 'brand' | 'category', value: string) {
    return (searchParams.get(key) ?? (scope?.key === key ? scope.value : null)) === value;
  }

  function renderFilterOption(option: CatalogFilterOption) {
    const depth = option.depth ?? 0;
    return <label key={option.value} className={depth ? 'catalog-filter-option catalog-filter-option--nested' : 'catalog-filter-option'} style={{ paddingLeft: `${depth * 18}px` }}><input type="checkbox" aria-label={option.label} checked={isSelected('brand', option.value)} onChange={(event) => toggleFilter('brand', option.value, event.target.checked)} />{depth ? <Icon aria-hidden="true" className="catalog-filter-option__branch" name="minus" size={12} strokeWidth={2} /> : null}{option.imagePath && !depth ? <span className="catalog-filter-option__image"><img src={option.imagePath} alt="" /></span> : null}<span>{option.label}</span></label>;
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams);
    next.delete('brand');
    next.delete('category');
    next.delete('page');
    if (scope) navigate(`/loja${next.size ? `?${next.toString()}` : ''}`);
    else setSearchParams(next);
  }

  return (
    <aside className="catalog-sidebar" aria-label="Filtros de produtos">
      <div className="catalog-sidebar__card">
        <div className="catalog-sidebar__header">
          <h2 className="sr-only">Filtro</h2>
          {searchParams.has('brand') || searchParams.has('category') || scope ? <button className="catalog-sidebar__clear" type="button" onClick={clearFilters}>Limpar</button> : null}
        </div>
        <div className="catalog-sidebar__filters" data-testid="catalog-filters-scroll">
          <fieldset>
            <legend><span className="catalog-sidebar__filter-title">Filtro</span>{' '}<span>Categoria Produtos</span></legend>
            {categories.map((category) => (
              <label key={category.value}>
                <input type="checkbox" aria-label={category.label} checked={isSelected('category', category.value)} onChange={(event) => toggleFilter('category', category.value, event.target.checked)} />
                {category.label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Filtro sub marcas</legend>
            {brandGroups.map(({ root, children }) => {
              const isCollapsed = collapsedBrands.has(root.value);
              const groupId = `brand-subitems-${root.value}`;
              return (
                <div className="catalog-filter-group" key={root.value}>
                  <div className="catalog-filter-group__heading">
                    {renderFilterOption(root)}
                    {children.length ? (
                      <button
                        className="catalog-filter-group__toggle"
                        type="button"
                        aria-controls={groupId}
                        aria-expanded={!isCollapsed}
                        aria-label={`${isCollapsed ? 'Expandir' : 'Recolher'} submarcas de ${root.label}`}
                        onClick={() => setCollapsedBrands((current) => {
                          const next = new Set(current);
                          if (next.has(root.value)) next.delete(root.value);
                          else next.add(root.value);
                          return next;
                        })}
                      >
                        <Icon name={isCollapsed ? 'plus' : 'minus'} size={16} strokeWidth={2} />
                      </button>
                    ) : <span className="catalog-filter-group__spacer" aria-hidden="true" />}
                  </div>
                  {!isCollapsed ? <div id={groupId} className="catalog-filter-group__children">{children.map(renderFilterOption)}</div> : null}
                </div>
              );
            })}
          </fieldset>
        </div>
      </div>
    </aside>
  );
}
