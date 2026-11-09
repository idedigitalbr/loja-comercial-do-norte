import { FormEvent, useEffect, useMemo, useState } from 'react';

type PostCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { posts: number };
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function PostCategoriesPage({ onBack }: { onBack: () => void }) {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<PostCategory | null>(null);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/posts/categories', { credentials: 'include' });
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  function handleNameChange(val: string) {
    setName(val);
    if (!editingItem) {
      setSlug(slugify(val));
    }
  }

  function startEdit(cat: PostCategory) {
    setEditingItem(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingItem(null);
    setName('');
    setSlug('');
    setDescription('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const body = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
      };

      if (editingItem) {
        const res = await fetch(`/api/v1/admin/posts/categories/${editingItem.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Erro ao atualizar categoria');
        setMessage(`Categoria "${name}" atualizada.`);
        cancelEdit();
      } else {
        const res = await fetch('/api/v1/admin/posts/categories', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Erro ao criar categoria');
        setMessage(`Categoria "${name}" adicionada.`);
        setName('');
        setSlug('');
        setDescription('');
      }

      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, catName: string) {
    if (!window.confirm(`Deseja realmente excluir a categoria "${catName}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/posts/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir categoria');
      setMessage(`Categoria "${catName}" excluída.`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (editingItem?.id === id) cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        (c.description?.toLowerCase().includes(term) ?? false)
    );
  }, [categories, search]);

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(filteredCategories.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  return (
    <section className="wp-admin-page">
      {/* WordPress Screen Heading */}
      <div className="wp-screen-heading">
        <div className="wp-screen-heading__left">
          <h1 className="wp-heading-inline">Categorias de posts</h1>
          <button type="button" className="page-title-action" onClick={onBack}>
            ← Voltar para Posts
          </button>
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

      {/* WordPress Two Column Layout (like Categories and Tags) */}
      <div className="wp-two-col-layout">
        {/* Left: Form */}
        <div className="wp-col-form">
          <div className="wp-form-wrap">
            <h2>{editingItem ? 'Editar categoria' : 'Adicionar nova categoria'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="wp-form-field">
                <label htmlFor="cat-name">Nome *</label>
                <input
                  id="cat-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nome da categoria"
                  required
                />
                <p className="wp-description">O nome é como ele aparece no seu blog.</p>
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
                  O “slug” é a versão amigável do URL do nome. Contém apenas letras minúsculas, números e hífens.
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
                  A descrição geralmente não é exibida por padrão; no entanto, alguns temas podem mostrá-la.
                </p>
              </div>

              <div className="wp-form-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Salvando...'
                    : editingItem
                      ? 'Atualizar categoria'
                      : 'Adicionar nova categoria'}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="wp-col-table">
          <div className="wp-tablenav top">
            <div className="alignright">
              <label htmlFor="tag-search-input" className="screen-reader-text">
                Pesquisar categorias:
              </label>
              <input
                type="search"
                id="tag-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar categorias..."
              />
            </div>
            <div className="tablenav-pages">
              <span className="displaying-num">{filteredCategories.length} itens</span>
            </div>
          </div>

          <table className="wp-list-table widefat fixed striped">
            <thead>
              <tr>
                <td id="cb" className="manage-column column-cb check-column">
                  <input
                    type="checkbox"
                    checked={
                      filteredCategories.length > 0 &&
                      selectedIds.length === filteredCategories.length
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </td>
                <th scope="col" className="manage-column column-title column-primary sortable">
                  <span>Nome</span>
                </th>
                <th scope="col" className="manage-column">
                  <span>Descrição</span>
                </th>
                <th scope="col" className="manage-column">
                  <span>Slug</span>
                </th>
                <th scope="col" className="manage-column" style={{ width: '80px', textAlign: 'center' }}>
                  <span>Posts</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="wp-empty-cell">
                    Carregando categorias...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="wp-empty-cell">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const isChecked = selectedIds.includes(cat.id);
                  const isEditing = editingItem?.id === cat.id;

                  return (
                    <tr
                      key={cat.id}
                      className={isEditing ? 'is-quick-editing' : ''}
                    >
                      <th scope="row" className="check-column">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(cat.id)}
                        />
                      </th>

                      <td className="column-title column-primary has-row-actions">
                        <strong>
                          <button
                            type="button"
                            className="wp-title-link"
                            onClick={() => startEdit(cat)}
                          >
                            {cat.name}
                          </button>
                        </strong>

                        <div className="row-actions">
                          <span className="id-tag">ID: {cat.id.slice(0, 8)} | </span>
                          <span className="edit">
                            <button
                              type="button"
                              className="wp-action-link"
                              onClick={() => startEdit(cat)}
                            >
                              Editar
                            </button>
                            {' | '}
                          </span>
                          <span className="trash">
                            <button
                              type="button"
                              className="wp-action-link wp-action-link--danger"
                              onClick={() => void handleDelete(cat.id, cat.name)}
                            >
                              Excluir
                            </button>
                          </span>
                        </div>
                      </td>

                      <td>{cat.description || <span className="wp-muted">—</span>}</td>

                      <td className="column-slug">{cat.slug}</td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="wp-count-badge">
                          {cat._count?.posts ?? 0}
                        </span>
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
