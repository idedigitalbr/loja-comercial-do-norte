import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Icon } from '@commerce/ui';

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  parentId?: string | null;
  parent?: { name: string } | null;
  description?: string;
};

type TreeCategoryItem = CategoryItem & { depth: number };

type ProductRef = {
  id: string;
  categories?: Array<{ category: { id: string } }>;
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

function flattenCategories(items: CategoryItem[]): TreeCategoryItem[] {
  const children = new Map<string | null, CategoryItem[]>();
  for (const item of items) {
    children.set(item.parentId ?? null, [...(children.get(item.parentId ?? null) ?? []), item]);
  }
  for (const list of children.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }
  const result: TreeCategoryItem[] = [];
  function visit(parentId: string | null, depth: number) {
    for (const item of children.get(parentId) ?? []) {
      result.push({ ...item, depth });
      visit(item.id, depth + 1);
    }
  }
  visit(null, 0);
  return result;
}

export function CategoriesPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductRef[]>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [categoryList, productList] = await Promise.all([
        getJson<CategoryItem[]>('/api/v1/admin/catalog/categories'),
        getJson<ProductRef[]>('/api/v1/admin/catalog/products').catch(() => []),
      ]);
      setCategories(categoryList);
      setProducts(productList);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao carregar categorias.');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const countByCategoryId = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      for (const cat of p.categories ?? []) {
        map.set(cat.category.id, (map.get(cat.category.id) ?? 0) + 1);
      }
    }
    return map;
  }, [products]);

  const tree = useMemo(() => flattenCategories(categories), [categories]);

  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;
    const term = search.toLowerCase();
    return tree.filter(
      (item) => item.name.toLowerCase().includes(term) || item.slug.toLowerCase().includes(term)
    );
  }, [tree, search]);

  const rootCategoryOptions = useMemo(() => {
    return categories.filter((c) => !c.parentId && c.id !== editingItem?.id);
  }, [categories, editingItem]);

  function handleNameChange(val: string) {
    setName(val);
    if (!editingItem && !slug) {
      setSlug(slugify(val));
    }
  }

  function startEdit(item: CategoryItem) {
    setEditingItem(item);
    setName(item.name);
    setSlug(item.slug);
    setParentId(item.parentId ?? '');
    setDescription(item.description ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingItem(null);
    setName('');
    setSlug('');
    setParentId('');
    setDescription('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const body = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        parentId: parentId || undefined,
        description: description.trim() || undefined,
      };

      const url = editingItem
        ? `/api/v1/admin/catalog/categories/${editingItem.id}`
        : '/api/v1/admin/catalog/categories';
      const method = editingItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? 'Não foi possível salvar a categoria.');
      }

      setMessage(editingItem ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.');
      cancelEdit();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(item: CategoryItem) {
    if (!window.confirm(`Tem certeza de que deseja excluir/arquivar a categoria "${item.name}"?`)) return;
    try {
      const response = await fetch(`/api/v1/admin/catalog/categories/${item.id}/archive`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Não foi possível excluir a categoria.');
      setMessage('Categoria arquivada.');
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro ao arquivar categoria.');
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

  return (
    <section className="wp-admin-page">
      <div className="wp-screen-heading">
        <div className="wp-screen-heading__left">
          <h1 className="wp-heading-inline">Categorias de produto</h1>
        </div>
      </div>

      {message && <div className="wp-notice wp-notice--success" role="status"><p>{message}</p></div>}
      {error && <div className="wp-notice wp-notice--error" role="alert"><p>{error}</p></div>}

      <div className="wp-two-col-layout">
        {/* Left Form: Add / Edit Category */}
        <div className="wp-col-form">
          <div className="wp-form-wrap">
            <h2>{editingItem ? 'Editar categoria' : 'Adicionar nova categoria'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="wp-form-field">
                <label htmlFor="cat-name">Nome</label>
                <input
                  id="cat-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nome da categoria"
                  required
                />
                <p className="wp-description">O nome é como ele aparece no seu site.</p>
              </div>

              <div className="wp-form-field">
                <label htmlFor="cat-slug">Slug</label>
                <input
                  id="cat-slug"
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
                <label htmlFor="cat-parent">Categoria ascendente</label>
                <select
                  id="cat-parent"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">Nenhuma (categoria principal)</option>
                  {rootCategoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="wp-description">
                  Categorias, diferente das tags, podem ter uma hierarquia. Você pode criar categorias mães e subcategorias.
                </p>
              </div>

              <div className="wp-form-field">
                <label htmlFor="cat-description">Descrição</label>
                <textarea
                  id="cat-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrição da categoria..."
                />
                <p className="wp-description">
                  A descrição não é muito exibida por padrão; no entanto, alguns temas podem exibi-la.
                </p>
              </div>

              <div className="wp-form-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving}
                >
                  {saving ? 'Salvando…' : editingItem ? 'Atualizar categoria' : 'Adicionar nova categoria'}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={cancelEdit}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Table: Category List */}
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
                    alert('Selecione ao menos uma categoria.');
                    return;
                  }
                  if (window.confirm(`Excluir as ${selectedIds.length} categorias selecionadas?`)) {
                    void Promise.all(
                      selectedIds.map((id) =>
                        fetch(`/api/v1/admin/catalog/categories/${id}/archive`, {
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
              <label htmlFor="cat-search-input" className="screen-reader-text">
                Pesquisar categorias:
              </label>
              <input
                type="search"
                id="cat-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar categorias..."
              />
              <button
                type="button"
                className="button"
                onClick={() => {}}
              >
                Pesquisar categorias
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
                  />
                </td>
                <th scope="col" className="manage-column column-name column-primary">
                  <span>Nome</span>
                </th>
                <th scope="col" className="manage-column column-description">
                  <span>Descrição</span>
                </th>
                <th scope="col" className="manage-column column-slug">
                  <span>Slug</span>
                </th>
                <th scope="col" className="manage-column column-count num">
                  <span>Contagem</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTree.length === 0 ? (
                <tr>
                  <td colSpan={5} className="wp-empty-cell">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              ) : (
                filteredTree.map((item) => {
                  const productCount = countByCategoryId.get(item.id) ?? 0;
                  const isChecked = selectedIds.includes(item.id);

                  return (
                    <tr key={item.id} className={item.depth > 0 ? 'level-child' : 'level-parent'}>
                      <th scope="row" className="check-column">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(item.id)}
                        />
                      </th>
                      <td className="column-name column-primary has-row-actions">
                        <strong className="row-title">
                          <button
                            type="button"
                            className="wp-title-link"
                            onClick={() => startEdit(item)}
                          >
                            {item.depth > 0 && (
                              <span className="wp-level-indicator">
                                {'— '.repeat(item.depth)}
                              </span>
                            )}
                            {item.name}
                          </button>
                        </strong>
                        <div className="row-actions">
                          <span className="edit">
                            <button
                              type="button"
                              className="wp-action-link"
                              onClick={() => startEdit(item)}
                            >
                              Editar
                            </button>
                            {' | '}
                          </span>
                          <span className="trash">
                            <button
                              type="button"
                              className="wp-action-link wp-action-link--danger"
                              onClick={() => void handleArchive(item)}
                            >
                              Excluir
                            </button>
                            {' | '}
                          </span>
                          <span className="view">
                            <a
                              href={`/categoria/${item.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="wp-action-link"
                            >
                              Ver na loja
                            </a>
                          </span>
                        </div>
                      </td>
                      <td className="column-description">
                        {item.description ? item.description : <span className="wp-muted">—</span>}
                      </td>
                      <td className="column-slug">{item.slug}</td>
                      <td className="column-count num">
                        <button
                          type="button"
                          className="wp-count-badge"
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate(`/admin/catalogo/produtos?category=${encodeURIComponent(item.id)}`);
                            }
                          }}
                          title="Ver produtos desta categoria"
                        >
                          {productCount}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="wp-tablenav bottom">
            <div className="tablenav-pages">
              <span className="displaying-num">{filteredTree.length} itens</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
