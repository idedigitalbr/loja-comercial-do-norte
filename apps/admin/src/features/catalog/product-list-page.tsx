import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Icon } from '@commerce/ui';
import { ImageDraft, ProductDraft, VariantDraft } from './product-form';

type TaxonomyItem = { id: string; name: string; slug: string; status: string };

type Product = Omit<ProductDraft, 'variants' | 'images'> & {
  id: string;
  status: string;
  brand?: { id: string; name: string; slug: string } | null;
  categories?: Array<{ category: TaxonomyItem }>;
  variants?: Array<
    VariantDraft & {
      id: string;
      inventoryBalance?: { physicalQuantity: number; reservedQuantity: number } | null;
    }
  >;
  images?: Array<ImageDraft & { isPrimary: boolean }>;
  createdAt?: string;
  updatedAt?: string;
};

type QuickEditState = {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  priceCents: number;
  stockQuantity: number;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER';
  status: string;
  isFeatured: boolean;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const FEATURED_STORAGE_KEY = 'cn_featured_product_ids';

function getStoredFeaturedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(FEATURED_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function persistFeaturedIds(ids: Set<string>) {
  try {
    localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore storage issues
  }
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Não foi possível carregar os dados.');
  return response.json() as Promise<T>;
}

function formatCurrency(cents = 0) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} às ${timeStr}`;
  } catch {
    return iso;
  }
}

export function ProductListPage({
  onCreate,
  onEdit,
  onCreateBrand,
  onEditBrand,
  onNavigate,
}: {
  onCreate: () => void;
  onEdit: (id: string) => void;
  onCreateBrand?: () => void;
  onEditBrand?: (id: string) => void;
  onNavigate?: (path: string) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<TaxonomyItem[]>([]);
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(() => getStoredFeaturedIds());

  // Filter and pagination state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'FEATURED' | 'ARCHIVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [productTypeFilter, setProductTypeFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [featuredFilter, setFeaturedFilter] = useState('ALL'); // Circled in red in screenshot
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Bulk actions and selections
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // Quick edit and UI overlays
  const [quickEdit, setQuickEdit] = useState<QuickEditState | null>(null);
  const [quickEditSaving, setQuickEditSaving] = useState(false);
  const [showScreenOptions, setShowScreenOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');

  // Visible columns preferences
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    sku: true,
    stock: true,
    price: true,
    categories: true,
    tags: true,
    featured: true,
    date: true,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [productList, brandList, categoryList] = await Promise.all([
        getJson<Product[]>('/api/v1/admin/catalog/products'),
        getJson<TaxonomyItem[]>('/api/v1/admin/catalog/brands'),
        getJson<TaxonomyItem[]>('/api/v1/admin/catalog/categories'),
      ]);
      setProducts(productList);
      setBrands(brandList);
      setCategories(categoryList);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao carregar catálogo.');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // Sync featured IDs changes to localStorage
  function toggleFeatured(productId: string) {
    setFeaturedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      persistFeaturedIds(next);
      return next;
    });
  }

  // Count metrics for subsubsub links
  const counts = useMemo(() => {
    let all = 0;
    let published = 0;
    let draft = 0;
    let featured = 0;
    let archived = 0;

    for (const p of products) {
      all += 1;
      if (p.status === 'ACTIVE') published += 1;
      if (p.status === 'DRAFT') draft += 1;
      if (p.status === 'ARCHIVED') archived += 1;
      if (featuredIds.has(p.id)) featured += 1;
    }

    return { all, published, draft, featured, archived };
  }, [products, featuredIds]);

  // Main filter pipeline
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Status sub-navigation filter
      if (statusFilter === 'ACTIVE' && product.status !== 'ACTIVE') return false;
      if (statusFilter === 'DRAFT' && product.status !== 'DRAFT') return false;
      if (statusFilter === 'ARCHIVED' && product.status !== 'ARCHIVED') return false;
      if (statusFilter === 'FEATURED' && !featuredIds.has(product.id)) return false;

      // Category filter
      if (categoryFilter !== 'ALL') {
        const hasCategory = product.categories?.some((c) => c.category.id === categoryFilter);
        if (!hasCategory) return false;
      }

      // Stock status filter
      if (stockFilter !== 'ALL') {
        const variant = product.variants?.[0];
        const stockStatus = variant?.stockStatus ?? 'IN_STOCK';
        if (stockFilter !== stockStatus) return false;
      }

      // Product Type filter (simple vs variable)
      if (productTypeFilter !== 'ALL') {
        const isVariable = (product.variants?.length ?? 0) > 1;
        if (productTypeFilter === 'variable' && !isVariable) return false;
        if (productTypeFilter === 'simple' && isVariable) return false;
      }

      // Featured status filter (circled in red in user screenshot)
      if (featuredFilter === 'featured' && !featuredIds.has(product.id)) return false;
      if (featuredFilter === 'not_featured' && featuredIds.has(product.id)) return false;

      // Search term
      if (search.trim()) {
        const term = search.toLowerCase();
        const firstVariant = product.variants?.[0];
        const searchPool = `${product.name} ${product.slug} ${firstVariant?.sku ?? ''} ${product.brand?.name ?? ''}`.toLowerCase();
        if (!searchPool.includes(term)) return false;
      }

      return true;
    });
  }, [
    products,
    statusFilter,
    categoryFilter,
    stockFilter,
    productTypeFilter,
    featuredFilter,
    featuredIds,
    search,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Selection handlers
  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(visibleProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleSelectProduct(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // Publish / Archive action
  async function action(id: string, type: 'publish' | 'archive') {
    try {
      const response = await fetch(`/api/v1/admin/catalog/products/${id}/${type}`, {
        method: 'POST',
        credentials: 'include',
      });
      const payload = (await response.json().catch(() => null)) as { message?: string; fields?: string[] } | null;
      if (!response.ok) {
        setError(
          payload?.fields?.length
            ? `Complete os campos: ${payload.fields.join(', ')}.`
            : payload?.message ?? 'Ação não concluída.'
        );
        return;
      }
      setMessage(type === 'publish' ? 'Produto publicado com sucesso.' : 'Produto arquivado.');
      await load();
    } catch {
      setError('Erro ao processar ação.');
    }
  }

  // Bulk actions executor
  async function applyBulkAction() {
    if (!bulkAction) return;
    if (selectedIds.length === 0) {
      alert('Selecione ao menos um produto para aplicar a ação em massa.');
      return;
    }

    if (bulkAction === 'trash') {
      if (!window.confirm(`Deseja mover ${selectedIds.length} produtos para a lixeira/arquivados?`)) return;
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/admin/catalog/products/${id}/archive`, { method: 'POST', credentials: 'include' })
        )
      );
      setMessage(`${selectedIds.length} produtos arquivados.`);
    } else if (bulkAction === 'publish') {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/v1/admin/catalog/products/${id}/publish`, { method: 'POST', credentials: 'include' })
        )
      );
      setMessage(`${selectedIds.length} produtos publicados.`);
    } else if (bulkAction === 'feature') {
      setFeaturedIds((prev) => {
        const next = new Set(prev);
        selectedIds.forEach((id) => next.add(id));
        persistFeaturedIds(next);
        return next;
      });
      setMessage(`${selectedIds.length} produtos marcados como destaque.`);
    } else if (bulkAction === 'unfeature') {
      setFeaturedIds((prev) => {
        const next = new Set(prev);
        selectedIds.forEach((id) => next.delete(id));
        persistFeaturedIds(next);
        return next;
      });
      setMessage(`${selectedIds.length} produtos desmarcados do destaque.`);
    }

    setSelectedIds([]);
    setBulkAction('');
    await load();
  }

  // Quick edit handlers
  function startQuickEdit(product: Product) {
    const variant = product.variants?.[0];
    setQuickEdit({
      productId: product.id,
      name: product.name,
      slug: product.slug ?? '',
      sku: variant?.sku ?? '',
      priceCents: variant?.priceCents ?? 0,
      stockQuantity: variant?.inventoryBalance?.physicalQuantity ?? variant?.inventoryQuantity ?? 0,
      stockStatus: variant?.stockStatus ?? 'IN_STOCK',
      status: product.status,
      isFeatured: featuredIds.has(product.id),
    });
  }

  async function saveQuickEdit(event: FormEvent) {
    event.preventDefault();
    if (!quickEdit) return;

    setQuickEditSaving(true);
    setError('');

    try {
      const payload = {
        name: quickEdit.name,
        slug: quickEdit.slug,
        variants: [
          {
            sku: quickEdit.sku,
            priceCents: quickEdit.priceCents,
            inventoryQuantity: quickEdit.stockQuantity,
            stockStatus: quickEdit.stockStatus,
            manageStock: true,
          },
        ],
      };

      const response = await fetch(`/api/v1/admin/catalog/products/${quickEdit.productId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Não foi possível salvar as alterações da edição rápida.');
      }

      // Update featured state if changed
      setFeaturedIds((prev) => {
        const next = new Set(prev);
        if (quickEdit.isFeatured) {
          next.add(quickEdit.productId);
        } else {
          next.delete(quickEdit.productId);
        }
        persistFeaturedIds(next);
        return next;
      });

      // Handle status update if modified
      const current = products.find((p) => p.id === quickEdit.productId);
      if (current && current.status !== quickEdit.status) {
        if (quickEdit.status === 'ACTIVE') {
          await fetch(`/api/v1/admin/catalog/products/${quickEdit.productId}/publish`, {
            method: 'POST',
            credentials: 'include',
          });
        } else if (quickEdit.status === 'ARCHIVED') {
          await fetch(`/api/v1/admin/catalog/products/${quickEdit.productId}/archive`, {
            method: 'POST',
            credentials: 'include',
          });
        }
      }

      setMessage(`Produto "${quickEdit.name}" atualizado.`);
      setQuickEdit(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao atualizar produto.');
    } finally {
      setQuickEditSaving(false);
    }
  }

  // Export CSV
  function handleExportCsv() {
    const headers = ['ID', 'Nome', 'Slug', 'SKU', 'Preço (R$)', 'Estoque', 'Status', 'Categorias', 'Marca', 'Destaque'];
    const rows = filteredProducts.map((p) => {
      const variant = p.variants?.[0];
      const stockQty = variant?.inventoryBalance?.physicalQuantity ?? variant?.inventoryQuantity ?? 0;
      const catNames = p.categories?.map((c) => c.category.name).join(', ') ?? '';
      const isFeat = featuredIds.has(p.id) ? 'Sim' : 'Não';
      const priceFormatted = ((variant?.priceCents ?? 0) / 100).toFixed(2).replace('.', ',');

      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.slug,
        variant?.sku ?? '',
        priceFormatted,
        stockQty,
        p.status,
        `"${catNames.replace(/"/g, '""')}"`,
        `"${(p.brand?.name ?? '').replace(/"/g, '""')}"`,
        isFeat,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `produtos-comercial-do-norte-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Instant Duplicate product
  async function handleDuplicate(product: Product) {
    try {
      const variant = product.variants?.[0];
      const newName = `${product.name} (Cópia)`;
      const newSku = variant?.sku ? `${variant.sku}-COP` : `SKU-${Date.now().toString().slice(-4)}`;

      const body = {
        name: newName,
        description: product.description ?? '',
        brandId: product.brand?.id,
        categoryIds: product.categories?.map((c) => c.category.id) ?? [],
        variants: [
          {
            sku: newSku,
            priceCents: variant?.priceCents ?? 0,
            manageStock: true,
            inventoryQuantity: 0,
            stockStatus: 'IN_STOCK' as const,
          },
        ],
      };

      const res = await fetch('/api/v1/admin/catalog/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Não foi possível duplicar o produto.');
      setMessage(`Produto duplicado como rascunho: "${newName}".`);
      await load();
    } catch {
      setError('Erro ao duplicar produto.');
    }
  }

  return (
    <section className="wp-admin-page">
      {/* Top Accordion Tabs: Screen Options and Help */}
      <div className="wp-screen-meta-wrap">
        <div className="wp-screen-meta-tabs">
          <button
            type="button"
            className={`wp-screen-meta-tab ${showHelp ? 'is-active' : ''}`}
            onClick={() => {
              setShowHelp((prev) => !prev);
              setShowScreenOptions(false);
            }}
          >
            Ajuda <span className="wp-arrow">{showHelp ? '▲' : '▼'}</span>
          </button>
          <button
            type="button"
            className={`wp-screen-meta-tab ${showScreenOptions ? 'is-active' : ''}`}
            onClick={() => {
              setShowScreenOptions((prev) => !prev);
              setShowHelp(false);
            }}
          >
            Opções de tela <span className="wp-arrow">{showScreenOptions ? '▲' : '▼'}</span>
          </button>
        </div>

        {showHelp && (
          <div className="wp-screen-meta-panel" role="region" aria-label="Ajuda do Catálogo">
            <h3>Gerenciamento de Produtos</h3>
            <p>
              Esta tela reproduz o fluxo de catálogo operacional do WooCommerce. Você pode gerenciar títulos, preços, estoque, categorias, destaque comercial e ações em massa.
            </p>
            <ul>
              <li><strong>Edição Rápida:</strong> Altere preço, SKU, estoque e status sem sair da lista.</li>
              <li><strong>Destaque comercial (⭐):</strong> Clique na estrela para alternar se o produto é destacado na loja.</li>
              <li><strong>Filtros rápidos:</strong> Utilize o filtro por categoria, tipo de produto, status de estoque e status de destaque.</li>
            </ul>
          </div>
        )}

        {showScreenOptions && (
          <div className="wp-screen-meta-panel" role="region" aria-label="Opções de Tela">
            <h5>Colunas visíveis</h5>
            <div className="wp-screen-options-grid">
              <label><input type="checkbox" checked={visibleColumns.image} onChange={(e) => setVisibleColumns((c) => ({ ...c, image: e.target.checked }))} /> Imagem</label>
              <label><input type="checkbox" checked={visibleColumns.sku} onChange={(e) => setVisibleColumns((c) => ({ ...c, sku: e.target.checked }))} /> SKU</label>
              <label><input type="checkbox" checked={visibleColumns.stock} onChange={(e) => setVisibleColumns((c) => ({ ...c, stock: e.target.checked }))} /> Estoque</label>
              <label><input type="checkbox" checked={visibleColumns.price} onChange={(e) => setVisibleColumns((c) => ({ ...c, price: e.target.checked }))} /> Preço</label>
              <label><input type="checkbox" checked={visibleColumns.categories} onChange={(e) => setVisibleColumns((c) => ({ ...c, categories: e.target.checked }))} /> Categorias</label>
              <label><input type="checkbox" checked={visibleColumns.tags} onChange={(e) => setVisibleColumns((c) => ({ ...c, tags: e.target.checked }))} /> Tags / Marca</label>
              <label><input type="checkbox" checked={visibleColumns.featured} onChange={(e) => setVisibleColumns((c) => ({ ...c, featured: e.target.checked }))} /> Em destaque</label>
              <label><input type="checkbox" checked={visibleColumns.date} onChange={(e) => setVisibleColumns((c) => ({ ...c, date: e.target.checked }))} /> Data</label>
            </div>
            <div className="wp-screen-options-pagination">
              <label>
                Itens por página:
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Screen Heading: "Produtos" + Add New / Import / Export */}
      <div className="wp-screen-heading">
        <div className="wp-screen-heading__left">
          <h1 className="wp-heading-inline">Produtos</h1>
          <button type="button" className="page-title-action" onClick={onCreate}>
            Adicionar novo
          </button>
          <button type="button" className="page-title-action" onClick={() => setShowImportModal(true)}>
            Importar
          </button>
          <button type="button" className="page-title-action" onClick={handleExportCsv}>
            Exportar
          </button>
        </div>
      </div>

      {message && <div className="wp-notice wp-notice--success" role="status"><p>{message}</p></div>}
      {error && <div className="wp-notice wp-notice--error" role="alert"><p>{error}</p></div>}

      {/* Subsubsub status links */}
      <ul className="subsubsub">
        <li className="all">
          <button
            type="button"
            className={statusFilter === 'ALL' ? 'current' : ''}
            onClick={() => { setStatusFilter('ALL'); setPage(1); }}
          >
            Tudo <span className="count">({counts.all})</span>
          </button>
          {' | '}
        </li>
        <li className="publish">
          <button
            type="button"
            className={statusFilter === 'ACTIVE' ? 'current' : ''}
            onClick={() => { setStatusFilter('ACTIVE'); setPage(1); }}
          >
            Publicados <span className="count">({counts.published})</span>
          </button>
          {' | '}
        </li>
        <li className="draft">
          <button
            type="button"
            className={statusFilter === 'DRAFT' ? 'current' : ''}
            onClick={() => { setStatusFilter('DRAFT'); setPage(1); }}
          >
            Rascunhos <span className="count">({counts.draft})</span>
          </button>
          {' | '}
        </li>
        <li className="featured">
          <button
            type="button"
            className={statusFilter === 'FEATURED' ? 'current' : ''}
            onClick={() => { setStatusFilter('FEATURED'); setPage(1); }}
          >
            Em destaque <span className="count">({counts.featured})</span>
          </button>
          {' | '}
        </li>
        <li className="trash">
          <button
            type="button"
            className={statusFilter === 'ARCHIVED' ? 'current' : ''}
            onClick={() => { setStatusFilter('ARCHIVED'); setPage(1); }}
          >
            Lixeira <span className="count">({counts.archived})</span>
          </button>
        </li>
      </ul>

      {/* Top Tablenav: Filters, Bulk Actions, Search and Pagination */}
      <div className="wp-tablenav top">
        <div className="alignleft actions bulkactions">
          <label htmlFor="bulk-action-selector-top" className="screen-reader-text">
            Selecionar ação em massa
          </label>
          <select
            id="bulk-action-selector-top"
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="">Ações em massa</option>
            <option value="publish">Publicar</option>
            <option value="trash">Mover para a lixeira</option>
            <option value="feature">Marcar como em destaque</option>
            <option value="unfeature">Remover do destaque</option>
          </select>
          <button type="button" className="button action" onClick={() => void applyBulkAction()}>
            Aplicar
          </button>
        </div>

        <div className="alignleft actions">
          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="ALL">Selecionar uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Product Type dropdown */}
          <select
            value={productTypeFilter}
            onChange={(e) => { setProductTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="ALL">Filtrar por tipo de produto</option>
            <option value="simple">Produto simples</option>
            <option value="variable">Produto com variações</option>
          </select>

          {/* Stock status dropdown */}
          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
          >
            <option value="ALL">Filtrar por status de estoque</option>
            <option value="IN_STOCK">Em estoque</option>
            <option value="OUT_OF_STOCK">Fora de estoque</option>
            <option value="ON_BACKORDER">Sob encomenda</option>
          </select>

          {/* FEATURED STATUS DROPDOWN (Circled in red in screenshot!) */}
          <select
            className="wp-featured-status-filter"
            value={featuredFilter}
            onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
          >
            <option value="ALL">Filtrar por destaque</option>
            <option value="featured">Em destaque</option>
            <option value="not_featured">Não destacado</option>
          </select>

          <button
            type="button"
            className="button"
            onClick={() => setPage(1)}
          >
            Filtrar
          </button>
        </div>

        {/* Search box right-aligned */}
        <div className="alignright">
          <label htmlFor="post-search-input" className="screen-reader-text">
            Pesquisar produtos:
          </label>
          <input
            type="search"
            id="post-search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput);
                setPage(1);
              }
            }}
            placeholder="Pesquisar produtos..."
          />
          <button
            type="button"
            className="button"
            onClick={() => {
              setSearch(searchInput);
              setPage(1);
            }}
          >
            Pesquisar produtos
          </button>
        </div>

        {/* Top Pagination info */}
        <div className="tablenav-pages">
          <span className="displaying-num">{filteredProducts.length} itens</span>
          {totalPages > 1 && (
            <span className="pagination-links">
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                title="Primeira página"
              >
                «
              </button>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                title="Página anterior"
              >
                ‹
              </button>
              <span className="paging-input">
                <span className="tablenav-paging-text">
                  {currentPage} de <span className="total-pages">{totalPages}</span>
                </span>
              </span>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                title="Próxima página"
              >
                ›
              </button>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
                title="Última página"
              >
                »
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Main WooCommerce / WordPress Table */}
      <table className="wp-list-table widefat fixed striped table-view-list posts-list">
        <thead>
          <tr>
            <td id="cb" className="manage-column column-cb check-column">
              <input
                id="cb-select-all-1"
                type="checkbox"
                checked={visibleProducts.length > 0 && selectedIds.length === visibleProducts.length}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </td>
            {visibleColumns.image && (
              <th scope="col" className="manage-column column-thumb">
                <span className="screen-reader-text">Imagem</span>
                <Icon name="image" size={16} strokeWidth={1.8} />
              </th>
            )}
            <th scope="col" className="manage-column column-title column-primary sortable">
              <span>Nome</span>
            </th>
            {visibleColumns.sku && (
              <th scope="col" className="manage-column column-sku sortable">
                <span>SKU</span>
              </th>
            )}
            {visibleColumns.stock && (
              <th scope="col" className="manage-column column-is_in_stock">
                <span>Estoque</span>
              </th>
            )}
            {visibleColumns.price && (
              <th scope="col" className="manage-column column-price sortable">
                <span>Preço</span>
              </th>
            )}
            {visibleColumns.categories && (
              <th scope="col" className="manage-column column-product_cat">
                <span>Categorias</span>
              </th>
            )}
            {visibleColumns.tags && (
              <th scope="col" className="manage-column column-product_tag">
                <span>Marca / Tags</span>
              </th>
            )}
            {visibleColumns.featured && (
              <th scope="col" className="manage-column column-featured">
                <span className="screen-reader-text">Destaque</span>
                <span title="Destaque">★</span>
              </th>
            )}
            {visibleColumns.date && (
              <th scope="col" className="manage-column column-date sortable">
                <span>Data</span>
              </th>
            )}
          </tr>
        </thead>

        <tbody id="the-list">
          {visibleProducts.length === 0 ? (
            <tr>
              <td colSpan={10} className="wp-empty-cell">
                Nenhum produto encontrado correspondente aos filtros.
              </td>
            </tr>
          ) : (
            visibleProducts.map((product) => {
              const variant = product.variants?.[0];
              const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
              const isChecked = selectedIds.includes(product.id);
              const isFeatured = featuredIds.has(product.id);
              const isQuickEditing = quickEdit?.productId === product.id;

              // Stock computation
              const stockStatus = variant?.stockStatus ?? 'IN_STOCK';
              const physicalQty = variant?.inventoryBalance?.physicalQuantity ?? variant?.inventoryQuantity ?? 0;
              const isOutOfStock = stockStatus === 'OUT_OF_STOCK' || (variant?.manageStock && physicalQty <= 0);
              const isOnBackorder = stockStatus === 'ON_BACKORDER';

              return (
                <tr
                  key={product.id}
                  id={`post-${product.id}`}
                  className={`${isQuickEditing ? 'is-quick-editing' : ''}`}
                >
                  <th scope="row" className="check-column">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectProduct(product.id)}
                    />
                  </th>

                  {visibleColumns.image && (
                    <td className="column-thumb">
                      <div className="wp-thumb-wrapper">
                        {primaryImage?.path ? (
                          <img
                            src={primaryImage.path}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/placeholders/placeholder-1.png';
                            }}
                          />
                        ) : (
                          <div className="wp-thumb-placeholder">
                            <Icon name="package" size={20} strokeWidth={1.5} />
                          </div>
                        )}
                      </div>
                    </td>
                  )}

                  <td className="column-title column-primary has-row-actions">
                    <strong>
                      <button
                        type="button"
                        className="wp-title-link"
                        onClick={() => onEdit(product.id)}
                      >
                        {product.name}
                      </button>
                      {product.status === 'DRAFT' && <span className="post-state"> — Rascunho</span>}
                      {product.status === 'ARCHIVED' && <span className="post-state"> — Arquivado</span>}
                    </strong>

                    {/* WordPress Row Actions (Hover / Focus) */}
                    <div className="row-actions">
                      <span className="id-tag">ID: {product.id.slice(-6)} | </span>
                      <span className="edit">
                        <button type="button" className="wp-action-link" onClick={() => onEdit(product.id)}>
                          Editar
                        </button>
                        {' | '}
                      </span>
                      <span className="quick-edit">
                        <button
                          type="button"
                          className="wp-action-link"
                          onClick={() => {
                            if (isQuickEditing) setQuickEdit(null);
                            else startQuickEdit(product);
                          }}
                        >
                          Edição rápida
                        </button>
                        {' | '}
                      </span>
                      {product.status !== 'ARCHIVED' ? (
                        <span className="trash">
                          <button
                            type="button"
                            className="wp-action-link wp-action-link--danger"
                            onClick={() => void action(product.id, 'archive')}
                          >
                            Lixeira
                          </button>
                          {' | '}
                        </span>
                      ) : (
                        <span className="publish">
                          <button
                            type="button"
                            className="wp-action-link wp-action-link--success"
                            onClick={() => void action(product.id, 'publish')}
                          >
                            Restaurar / Publicar
                          </button>
                          {' | '}
                        </span>
                      )}
                      <span className="view">
                        <a
                          href={`/produto/${product.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="wp-action-link"
                        >
                          Ver na loja
                        </a>
                        {' | '}
                      </span>
                      <span className="duplicate">
                        <button
                          type="button"
                          className="wp-action-link"
                          onClick={() => void handleDuplicate(product)}
                        >
                          Duplicar
                        </button>
                      </span>
                    </div>

                    {/* Inline Quick Edit Form */}
                    {isQuickEditing && quickEdit && (
                      <div className="wp-quick-edit-row">
                        <form onSubmit={saveQuickEdit} className="wp-quick-edit-form">
                          <h4>Edição rápida</h4>
                          <div className="wp-quick-edit-fields">
                            <div className="wp-quick-col">
                              <label>
                                <span>Título</span>
                                <input
                                  type="text"
                                  value={quickEdit.name}
                                  onChange={(e) => setQuickEdit({ ...quickEdit, name: e.target.value })}
                                  required
                                />
                              </label>
                              <label>
                                <span>Slug</span>
                                <input
                                  type="text"
                                  value={quickEdit.slug}
                                  onChange={(e) => setQuickEdit({ ...quickEdit, slug: e.target.value })}
                                />
                              </label>
                            </div>

                            <div className="wp-quick-col">
                              <label>
                                <span>SKU</span>
                                <input
                                  type="text"
                                  value={quickEdit.sku}
                                  onChange={(e) => setQuickEdit({ ...quickEdit, sku: e.target.value })}
                                />
                              </label>
                              <label>
                                <span>Preço (R$)</span>
                                <input
                                  type="text"
                                  value={(quickEdit.priceCents / 100).toFixed(2).replace('.', ',')}
                                  onChange={(e) => {
                                    const parsed = parseFloat(e.target.value.replace(',', '.'));
                                    setQuickEdit({
                                      ...quickEdit,
                                      priceCents: Number.isFinite(parsed) ? Math.round(parsed * 100) : 0,
                                    });
                                  }}
                                />
                              </label>
                            </div>

                            <div className="wp-quick-col">
                              <label>
                                <span>Quantidade de estoque</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={quickEdit.stockQuantity}
                                  onChange={(e) =>
                                    setQuickEdit({
                                      ...quickEdit,
                                      stockQuantity: parseInt(e.target.value, 10) || 0,
                                    })
                                  }
                                />
                              </label>
                              <label>
                                <span>Status de estoque</span>
                                <select
                                  value={quickEdit.stockStatus}
                                  onChange={(e) =>
                                    setQuickEdit({
                                      ...quickEdit,
                                      stockStatus: e.target.value as QuickEditState['stockStatus'],
                                    })
                                  }
                                >
                                  <option value="IN_STOCK">Em estoque</option>
                                  <option value="OUT_OF_STOCK">Fora de estoque</option>
                                  <option value="ON_BACKORDER">Sob encomenda</option>
                                </select>
                              </label>
                            </div>

                            <div className="wp-quick-col">
                              <label>
                                <span>Status</span>
                                <select
                                  value={quickEdit.status}
                                  onChange={(e) => setQuickEdit({ ...quickEdit, status: e.target.value })}
                                >
                                  <option value="ACTIVE">Publicado</option>
                                  <option value="DRAFT">Rascunho</option>
                                  <option value="ARCHIVED">Arquivado</option>
                                </select>
                              </label>
                              <label className="wp-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={quickEdit.isFeatured}
                                  onChange={(e) => setQuickEdit({ ...quickEdit, isFeatured: e.target.checked })}
                                />
                                <span>Em destaque</span>
                              </label>
                            </div>
                          </div>

                          <div className="wp-quick-edit-actions">
                            <button
                              type="button"
                              className="button button-secondary"
                              onClick={() => setQuickEdit(null)}
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="button button-primary"
                              disabled={quickEditSaving}
                            >
                              {quickEditSaving ? 'Atualizando…' : 'Atualizar'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </td>

                  {visibleColumns.sku && (
                    <td className="column-sku">
                      {variant?.sku ? variant.sku : <span className="wp-muted">—</span>}
                    </td>
                  )}

                  {visibleColumns.stock && (
                    <td className="column-is_in_stock">
                      {isOutOfStock ? (
                        <mark className="wp-stock wp-stock--outofstock">Fora de estoque</mark>
                      ) : isOnBackorder ? (
                        <mark className="wp-stock wp-stock--onbackorder">Sob encomenda</mark>
                      ) : (
                        <mark className="wp-stock wp-stock--instock">
                          Em estoque {variant?.manageStock ? `(${physicalQty})` : ''}
                        </mark>
                      )}
                    </td>
                  )}

                  {visibleColumns.price && (
                    <td className="column-price">
                      {variant?.priceCents ? (
                        formatCurrency(variant.priceCents)
                      ) : (
                        <span className="wp-muted">R$ 0,00</span>
                      )}
                    </td>
                  )}

                  {visibleColumns.categories && (
                    <td className="column-product_cat">
                      {product.categories?.length ? (
                        product.categories.map((c, i) => (
                          <span key={c.category.id}>
                            <button
                              type="button"
                              className="wp-term-link"
                              onClick={() => {
                                setCategoryFilter(c.category.id);
                                setPage(1);
                              }}
                            >
                              {c.category.name}
                            </button>
                            {i < (product.categories?.length ?? 1) - 1 ? ', ' : ''}
                          </span>
                        ))
                      ) : (
                        <span className="wp-muted">—</span>
                      )}
                    </td>
                  )}

                  {visibleColumns.tags && (
                    <td className="column-product_tag">
                      {product.brand?.name ? (
                        <span className="wp-brand-tag">{product.brand.name}</span>
                      ) : (
                        <span className="wp-muted">—</span>
                      )}
                    </td>
                  )}

                  {visibleColumns.featured && (
                    <td className="column-featured">
                      <button
                        type="button"
                        className={`wp-star-button ${isFeatured ? 'is-featured' : ''}`}
                        onClick={() => toggleFeatured(product.id)}
                        title={isFeatured ? 'Remover destaque' : 'Marcar como destaque'}
                        aria-label={isFeatured ? 'Produto em destaque' : 'Produto não destacado'}
                      >
                        {isFeatured ? '★' : '☆'}
                      </button>
                    </td>
                  )}

                  {visibleColumns.date && (
                    <td className="column-date">
                      {product.status === 'ACTIVE' ? 'Publicado' : 'Última modificação'}
                      <br />
                      <abbr title={product.updatedAt ?? product.createdAt ?? ''}>
                        {formatDate(product.updatedAt ?? product.createdAt)}
                      </abbr>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Bottom Tablenav */}
      <div className="wp-tablenav bottom">
        <div className="alignleft actions bulkactions">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="">Ações em massa</option>
            <option value="publish">Publicar</option>
            <option value="trash">Mover para a lixeira</option>
            <option value="feature">Marcar como em destaque</option>
            <option value="unfeature">Remover do destaque</option>
          </select>
          <button type="button" className="button action" onClick={() => void applyBulkAction()}>
            Aplicar
          </button>
        </div>

        <div className="tablenav-pages">
          <span className="displaying-num">{filteredProducts.length} itens</span>
          {totalPages > 1 && (
            <span className="pagination-links">
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
              >
                «
              </button>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </button>
              <span className="paging-input">
                {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                ›
              </button>
              <button
                type="button"
                className="tablenav-pages-navspan button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
              >
                »
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="wp-modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="wp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wp-modal__header">
              <h2>Importar produtos</h2>
              <button
                type="button"
                className="wp-modal__close"
                onClick={() => setShowImportModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="wp-modal__body">
              <p>Cole o JSON dos produtos ou envie arquivo no formato estruturado do catálogo.</p>
              <textarea
                rows={8}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='[{"name": "Produto Exemplo", "sku": "EX-01", "priceCents": 1990}]'
              />
            </div>
            <div className="wp-modal__footer">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowImportModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(importJson) as Array<{ name: string; sku?: string; priceCents?: number }>;
                    if (!Array.isArray(parsed)) throw new Error('O JSON deve ser uma lista de produtos.');
                    void Promise.all(
                      parsed.map((item) =>
                        fetch('/api/v1/admin/catalog/products', {
                          method: 'POST',
                          credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: item.name,
                            variants: [{ sku: item.sku || `SKU-${Date.now()}`, priceCents: item.priceCents || 0 }],
                          }),
                        })
                      )
                    ).then(() => {
                      setShowImportModal(false);
                      setImportJson('');
                      setMessage(`${parsed.length} produtos importados.`);
                      void load();
                    });
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'JSON inválido.');
                  }
                }}
              >
                Importar agora
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
