import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getStorefrontUrl } from '../../admin-shell';
import { resolveMediaUrl, handleImageFallback } from '../../utils/media-url';

export type BrandItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  description?: string | null;
  imagePath?: string | null;
  _count?: { products: number; children: number };
};

type TreeBrandItem = BrandItem & { depth: number; totalProducts: number };

type ProductRef = {
  id: string;
  brand?: { id: string; name: string } | null;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Não foi possível carregar os dados.');
  return response.json() as Promise<T>;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function flattenBrands(items: BrandItem[], countByBrandId: Map<string, number>): TreeBrandItem[] {
  const childrenMap = new Map<string | null, BrandItem[]>();
  for (const item of items) {
    const pId = item.parentId ?? null;
    childrenMap.set(pId, [...(childrenMap.get(pId) ?? []), item]);
  }
  for (const list of childrenMap.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  const result: TreeBrandItem[] = [];

  function visit(parentId: string | null, depth: number) {
    const children = childrenMap.get(parentId) ?? [];
    for (const item of children) {
      const direct = countByBrandId.get(item.id) ?? item._count?.products ?? 0;
      // Recurse children to get total products for parent
      const subChildren = childrenMap.get(item.id) ?? [];
      const subTotal = subChildren.reduce(
        (sum, child) => sum + (countByBrandId.get(child.id) ?? child._count?.products ?? 0),
        0
      );
      result.push({ ...item, depth, totalProducts: direct + subTotal });
      visit(item.id, depth + 1);
    }
  }

  visit(null, 0);
  return result;
}

export function BrandsPage({
  onNavigate,
  onOpenBrandEditor,
}: {
  onNavigate?: (path: string) => void;
  onOpenBrandEditor?: (id: string) => void;
}) {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [products, setProducts] = useState<ProductRef[]>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [editingItem, setEditingItem] = useState<BrandItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [brandList, productList] = await Promise.all([
        getJson<BrandItem[]>('/api/v1/admin/catalog/brands'),
        getJson<ProductRef[]>('/api/v1/admin/catalog/products').catch(() => []),
      ]);
      setBrands(brandList);
      setProducts(productList);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao carregar marcas.');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const countByBrandId = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (p.brand?.id) {
        map.set(p.brand.id, (map.get(p.brand.id) ?? 0) + 1);
      }
    }
    return map;
  }, [products]);

  const tree = useMemo(() => flattenBrands(brands, countByBrandId), [brands, countByBrandId]);

  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;
    const term = search.toLowerCase();
    return tree.filter(
      (item) => item.name.toLowerCase().includes(term) || item.slug.toLowerCase().includes(term)
    );
  }, [tree, search]);

  const rootBrandOptions = useMemo(() => {
    return brands.filter((item) => !item.parentId && item.id !== editingItem?.id);
  }, [brands, editingItem]);

  function handleNameChange(val: string) {
    setName(val);
    if (!editingItem && !slug) {
      setSlug(slugify(val));
    }
  }

  function startEdit(item: BrandItem) {
    setEditingItem(item);
    setName(item.name);
    setSlug(item.slug);
    setParentId(item.parentId ?? '');
    setDescription(item.description ?? '');
    setImagePath(item.imagePath ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingItem(null);
    setName('');
    setSlug('');
    setParentId('');
    setDescription('');
    setImagePath('');
  }

  function startAddSubbrand(parent: BrandItem) {
    setEditingItem(null);
    setName('');
    setSlug('');
    setParentId(parent.id);
    setDescription('');
    setImagePath('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', name || 'Marca');
      const res = await fetch('/api/v1/admin/media/brand-images', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const payload = (await res.json().catch(() => null)) as { path?: string; message?: string } | null;
      if (!res.ok || !payload?.path) {
        throw new Error(payload?.message ?? 'Não foi possível enviar a imagem da marca.');
      }
      setImagePath(payload.path);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    setMessage('');

    const targetSlug = slug.trim() ? slugify(slug) : slugify(name);
    const payload = {
      name: name.trim(),
      slug: targetSlug,
      parentId: parentId.trim() || undefined,
      description: description.trim() || undefined,
      imagePath: !parentId ? imagePath.trim() || undefined : undefined,
    };

    try {
      const url = editingItem
        ? `/api/v1/admin/catalog/brands/${editingItem.id}`
        : '/api/v1/admin/catalog/brands';
      const method = editingItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errJson?.message ?? 'Erro ao salvar marca.');
      }

      setMessage(editingItem ? 'Marca atualizada com sucesso.' : 'Marca criada com sucesso.');
      cancelEdit();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao salvar marca.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(item: BrandItem) {
    if (!window.confirm(`Tem certeza de que deseja arquivar a marca "${item.name}"?`)) return;
    try {
      const response = await fetch(`/api/v1/admin/catalog/brands/${item.id}/archive`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Não foi possível arquivar a marca.');
      setMessage('Marca arquivada com sucesso.');
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao arquivar marca.');
    }
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(filteredTree.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  const storefrontBase = getStorefrontUrl();

  return (
    <section className="wp-admin-page">
      <div className="wp-screen-heading">
        <div className="wp-screen-heading__left">
          <h1 className="wp-heading-inline">Marcas de produto</h1>
        </div>
      </div>

      {message && (
        <div className="wp-notice wp-notice--success" role="status">
          <p>{message}</p>
        </div>
      )}
      {error && (
        <div className="wp-notice wp-notice--error" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="wp-two-col-layout">
        {/* Left Form: Add / Edit Brand */}
        <div className="wp-col-form">
          <div className="wp-form-wrap">
            <h2>{editingItem ? 'Editar marca' : 'Adicionar nova marca'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="wp-form-field">
                <label htmlFor="brand-name">Nome</label>
                <input
                  id="brand-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nome da marca"
                  required
                />
                <p className="wp-description">O nome é como ele aparece no seu site e nos filtros.</p>
              </div>

              <div className="wp-form-field">
                <label htmlFor="brand-slug">Slug</label>
                <input
                  id="brand-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-amigavel"
                />
                <p className="wp-description">
                  O “slug” é a versão amigável do URL do nome. Geralmente contém apenas letras minúsculas, números e hífens.
                </p>
              </div>

              <div className="wp-form-field">
                <label htmlFor="brand-parent">Marca ascendente</label>
                <select
                  id="brand-parent"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">Nenhuma (marca principal)</option>
                  {rootBrandOptions.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <p className="wp-description">
                  Marcas, assim como categorias, podem ter uma hierarquia: marca principal (ex: Fasapel, Lanchero) e submarcas/linhas (ex: Guardanapos & Toalhas, Hamburgueiras).
                </p>
              </div>

              <div className="wp-form-field">
                <label htmlFor="brand-description">Descrição</label>
                <textarea
                  id="brand-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Apresente a marca e sua linha profissional..."
                />
                <p className="wp-description">
                  Apresentação institucional da marca exibida na vitrine e filtros do catálogo.
                </p>
              </div>

              {!parentId && (
                <div className="wp-form-field">
                  <label htmlFor="brand-image">Imagem / Logo da marca</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.35rem' }}>
                    {imagePath ? (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 4,
                          border: '1px solid #c3c4c7',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fff',
                        }}
                      >
                        <img
                          src={resolveMediaUrl(imagePath)}
                          alt="Logo da marca"
                          onError={handleImageFallback}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    ) : null}
                    <input
                      id="brand-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploading}
                      onChange={(e) => void handleImageUpload(e.target.files?.[0])}
                    />
                  </div>
                  {uploading && <p className="wp-description">Enviando imagem...</p>}
                  <p className="wp-description">PNG, JPG ou WebP. Somente marcas principais recebem imagem.</p>
                </div>
              )}

              <div className="wp-form-actions">
                <button type="submit" className="button button-primary" disabled={saving}>
                  {saving ? 'Salvando…' : editingItem ? 'Atualizar marca' : 'Adicionar nova marca'}
                </button>
                {editingItem && (
                  <button type="button" className="button button-secondary" onClick={cancelEdit}>
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Table: Brand List */}
        <div className="wp-col-table">
          <div className="wp-tablenav top">
            <div className="alignleft actions bulkactions">
              <label htmlFor="bulk-action-selector-top" className="screen-reader-text">
                Selecionar ação em massa
              </label>
              <select id="bulk-action-selector-top" defaultValue="">
                <option value="">Ações em massa</option>
                <option value="delete">Excluir selecionadas</option>
              </select>
              <button
                type="button"
                className="button action"
                onClick={() => {
                  if (selectedIds.length === 0) {
                    alert('Selecione ao menos uma marca.');
                    return;
                  }
                  if (window.confirm(`Arquivar as ${selectedIds.length} marcas selecionadas?`)) {
                    void Promise.all(
                      selectedIds.map((id) =>
                        fetch(`/api/v1/admin/catalog/brands/${id}/archive`, {
                          method: 'POST',
                          credentials: 'include',
                        })
                      )
                    ).then(() => {
                      setSelectedIds([]);
                      void load();
                    });
                  }
                }}
              >
                Aplicar
              </button>
            </div>

            <div className="alignright">
              <label htmlFor="brand-search-input" className="screen-reader-text">
                Pesquisar marcas:
              </label>
              <input
                type="search"
                id="brand-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar marcas..."
              />
              <button
                type="button"
                className="button"
                onClick={() => {
                  /* Search is reactive */
                }}
              >
                Pesquisar marcas
              </button>
            </div>
          </div>

          <table className="wp-list-table widefat fixed striped table-view-list">
            <thead>
              <tr>
                <td className="manage-column column-cb check-column">
                  <input
                    type="checkbox"
                    checked={filteredTree.length > 0 && selectedIds.length === filteredTree.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    aria-label="Selecionar todas as marcas"
                  />
                </td>
                <th scope="col" style={{ width: '56px' }}>
                  <span>Logo</span>
                </th>
                <th scope="col" className="manage-column column-name column-primary">
                  <span>Nome</span>
                </th>
                <th scope="col" className="manage-column column-description">
                  <span>Descrição</span>
                </th>
                <th scope="col" className="manage-column column-slug">
                  <span>Slug</span>
                </th>
                <th
                  scope="col"
                  className="manage-column column-posts num"
                  style={{ textAlign: 'right', width: '90px' }}
                >
                  <span>Contagem</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTree.length === 0 ? (
                <tr className="no-items">
                  <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#646970' }}>
                    Nenhuma marca encontrada.
                  </td>
                </tr>
              ) : (
                filteredTree.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  const isRoot = !item.parentId;

                  return (
                    <tr key={item.id} className={isChecked ? 'is-selected' : ''}>
                      <th scope="row" className="check-column">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(item.id)}
                          aria-label={`Selecionar ${item.name}`}
                        />
                      </th>
                      <td style={{ verticalAlign: 'middle' }}>
                        {item.imagePath ? (
                          <img
                            src={resolveMediaUrl(item.imagePath)}
                            alt={item.name}
                            onError={handleImageFallback}
                            style={{
                              width: 32,
                              height: 32,
                              objectFit: 'contain',
                              borderRadius: 3,
                              border: '1px solid #e2e8f0',
                              background: '#fff',
                            }}
                          />
                        ) : (
                          <span style={{ color: '#a0aec0', fontSize: '11px' }}>—</span>
                        )}
                      </td>
                      <td className="column-name column-primary has-row-actions">
                        <strong>
                          <span
                            style={{
                              fontWeight: isRoot ? 600 : 400,
                              color: isRoot ? '#1d2327' : '#50575e',
                            }}
                          >
                            {item.depth > 0 ? `${'— '.repeat(item.depth)}` : ''}
                            {item.name}
                          </span>
                        </strong>
                        <div className="row-actions">
                          <span className="edit">
                            <button
                              type="button"
                              className="button-link"
                              onClick={() => startEdit(item)}
                            >
                              Editar
                            </button>
                            {' | '}
                          </span>
                          {onOpenBrandEditor && (
                            <span className="edit-full">
                              <button
                                type="button"
                                className="button-link"
                                onClick={() => onOpenBrandEditor(item.id)}
                              >
                                Editor avançado
                              </button>
                              {' | '}
                            </span>
                          )}
                          {isRoot && (
                            <span className="add-child">
                              <button
                                type="button"
                                className="button-link"
                                onClick={() => startAddSubbrand(item)}
                              >
                                + Submarca
                              </button>
                              {' | '}
                            </span>
                          )}
                          <span className="delete">
                            <button
                              type="button"
                              className="button-link delete-tag"
                              onClick={() => void handleArchive(item)}
                            >
                              Excluir
                            </button>
                            {' | '}
                          </span>
                          <span className="view">
                            <a
                              href={`${storefrontBase}/marca/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="button-link"
                            >
                              Ver na loja
                            </a>
                          </span>
                        </div>
                      </td>
                      <td className="column-description">
                        {item.description ? (
                          <span title={item.description}>
                            {item.description.length > 60
                              ? `${item.description.slice(0, 60)}…`
                              : item.description}
                          </span>
                        ) : (
                          <span className="wp-muted">—</span>
                        )}
                      </td>
                      <td className="column-slug">{item.slug}</td>
                      <td className="column-posts num" style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="wp-term-count-badge"
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate(`/admin/catalogo/produtos?brand=${item.slug}`);
                            }
                          }}
                          title={`Ver produtos da marca ${item.name}`}
                          style={{
                            background: item.totalProducts > 0 ? '#2271b1' : '#f0f0f1',
                            color: item.totalProducts > 0 ? '#fff' : '#646970',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '2px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {item.totalProducts}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
