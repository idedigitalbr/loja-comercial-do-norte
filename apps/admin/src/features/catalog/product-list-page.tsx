import { useEffect, useMemo, useState } from 'react';
import { ImageDraft, ProductDraft, VariantDraft } from './product-form';
import { TaxonomyManager } from './taxonomy-manager';

type TaxonomyItem = { id: string; name: string; slug: string; status: string };
type Product = Omit<ProductDraft, 'variants' | 'images'> & {
  id: string;
  status: string;
  brand?: { name: string } | null;
  categories?: Array<{ category: TaxonomyItem }>;
  variants?: Array<VariantDraft & { id: string; inventoryBalance?: { physicalQuantity: number; reservedQuantity: number } | null }>;
  images?: Array<ImageDraft & { isPrimary: boolean }>;
};
type CatalogTab = 'products' | 'brands' | 'categories';
const PAGE_SIZE = 12;

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Não foi possível carregar os dados.');
  return response.json() as Promise<T>;
}

function formatCurrency(cents = 0) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function ProductListPage({ onCreate, onEdit, onCreateBrand, onEditBrand }: { onCreate: () => void; onEdit: (id: string) => void; onCreateBrand: () => void; onEditBrand: (id: string) => void }) {
  const [tab, setTab] = useState<CatalogTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<TaxonomyItem[]>([]);
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [productList, brandList, categoryList] = await Promise.all([
        getJson<Product[]>('/api/v1/admin/catalog/products'),
        getJson<TaxonomyItem[]>('/api/v1/admin/catalog/brands'),
        getJson<TaxonomyItem[]>('/api/v1/admin/catalog/categories'),
      ]);
      setProducts(productList); setBrands(brandList); setCategories(categoryList); setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao carregar catálogo.');
    }
  }

  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => products.filter((product) => {
    const matchesSearch = !search || `${product.name} ${product.slug} ${product.brand?.name ?? ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === 'ALL' || product.status === status);
  }), [products, search, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function action(id: string, type: 'publish' | 'archive') {
    const response = await fetch(`/api/v1/admin/catalog/products/${id}/${type}`, { method: 'POST', credentials: 'include' });
    const payload = await response.json().catch(() => null) as { message?: string; fields?: string[] } | null;
    if (!response.ok) { setError(payload?.fields?.length ? `Complete: ${payload.fields.join(', ')}.` : payload?.message ?? 'Ação não concluída.'); return; }
    setMessage(type === 'publish' ? 'Produto publicado.' : 'Produto arquivado.'); await load();
  }

  return (
    <section className="admin-page">
      <div className="admin-page__heading"><div><p className="admin-eyebrow">WooCommerce / catálogo</p><h2>Catálogo</h2></div><p>Produtos, variações, estoque, marcas e categorias em um único fluxo operacional.</p></div>
      <div className="admin-tabbar" role="tablist"><button className={tab === 'products' ? 'is-active' : ''} type="button" onClick={() => setTab('products')}>Produtos <span>{products.length}</span></button><button className={tab === 'brands' ? 'is-active' : ''} type="button" onClick={() => setTab('brands')}>Marcas <span>{brands.length}</span></button><button className={tab === 'categories' ? 'is-active' : ''} type="button" onClick={() => setTab('categories')}>Categorias <span>{categories.length}</span></button></div>
      {message ? <p className="admin-success" role="status">{message}</p> : null}{error ? <p className="admin-error" role="alert">{error}</p> : null}
      {tab === 'brands' ? <TaxonomyManager kind="brands" items={brands} onReload={load} onCreateBrand={onCreateBrand} onOpenBrand={onEditBrand} /> : null}
      {tab === 'categories' ? <TaxonomyManager kind="categories" items={categories} onReload={load} /> : null}
      {tab === 'products' ? <>
        <div className="admin-card admin-toolbar"><div><strong>{filtered.length} produtos</strong><span>Catálogo completo, incluindo rascunhos e arquivados.</span></div><button className="admin-button admin-button--compact" type="button" onClick={onCreate}>Novo produto</button></div>
        <div className="admin-card admin-table-card">
          <div className="admin-toolbar admin-toolbar--filters"><label className="admin-search">Buscar produto<input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nome, SKU ou marca" /></label><label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="ALL">Todos</option><option value="ACTIVE">Ativos</option><option value="DRAFT">Rascunhos</option><option value="ARCHIVED">Arquivados</option></select></label></div>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produto</th><th>Marca / categoria</th><th>Variação</th><th>Preço</th><th>Status</th><th /></tr></thead><tbody>{visible.map((product) => {
            const variant = product.variants?.[0]; const physicalQuantity = variant?.inventoryBalance?.physicalQuantity ?? variant?.inventoryQuantity ?? 0;
            return <tr key={product.id}><td><strong>{product.name}</strong><small className="admin-table__subline">/{product.slug}</small></td><td><span>{product.brand?.name ?? 'Sem marca'}</span><small className="admin-table__subline">{product.categories?.[0]?.category.name ?? 'Sem categoria'}</small></td><td><span>{variant?.sku ?? 'Sem SKU'}</span><small className="admin-table__subline">{variant ? `${physicalQuantity} un.` : 'Sem variação'}</small></td><td>{formatCurrency(variant?.priceCents)}</td><td><span className={`admin-status admin-status--${product.status.toLowerCase()}`}>{product.status}</span></td><td className="admin-table__actions"><button className="admin-link-button" type="button" onClick={() => onEdit(product.id)}>Editar</button>{product.status !== 'ACTIVE' ? <button className="admin-link-button" type="button" onClick={() => void action(product.id, 'publish')}>Publicar</button> : null}{product.status !== 'ARCHIVED' ? <button className="admin-link-button admin-link-button--danger" type="button" onClick={() => void action(product.id, 'archive')}>Arquivar</button> : null}</td></tr>;
          })}</tbody></table>{!visible.length ? <p className="admin-empty">Nenhum produto corresponde aos filtros.</p> : null}</div>
          <div className="admin-pagination"><span>Página {page} de {pages}</span><div><button className="admin-button admin-button--quiet admin-button--compact" disabled={page === 1} type="button" onClick={() => setPage(page - 1)}>Anterior</button><button className="admin-button admin-button--quiet admin-button--compact" disabled={page === pages} type="button" onClick={() => setPage(page + 1)}>Próxima</button></div></div>
        </div>
      </> : null}
    </section>
  );
}
