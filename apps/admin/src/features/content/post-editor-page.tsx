import { FormEvent, useEffect, useState } from 'react';
import { resolveMediaUrl, handleImageFallback } from '../../utils/media-url';

type PostCategory = { id: string; name: string; slug: string };

type PostDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  videoUrl: string;
  authorName: string;
  badges: string[];
  status: 'ACTIVE' | 'DRAFT';
  categoryId: string;
};

export function PostEditorPage({
  postId,
  onBack,
  onSaved,
}: {
  postId?: string;
  onBack: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(postId);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [badgeInput, setBadgeInput] = useState('');

  const [draft, setDraft] = useState<PostDraft>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverUrl: '',
    videoUrl: '',
    authorName: 'Comercial do Norte',
    badges: [],
    status: 'ACTIVE',
    categoryId: '',
  });

  useEffect(() => {
    fetch('/api/v1/admin/posts/categories', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((cats) => setCategories(cats))
      .catch(() => undefined);

    if (postId) {
      fetch(`/api/v1/admin/posts/${encodeURIComponent(postId)}`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setDraft({
              title: data.title || '',
              slug: data.slug || '',
              excerpt: data.excerpt || '',
              content: data.content || '',
              coverUrl: data.coverUrl || '',
              videoUrl: data.videoUrl || '',
              authorName: data.authorName || 'Comercial do Norte',
              badges: data.badges || [],
              status: data.status || 'ACTIVE',
              categoryId: data.categoryId || '',
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [postId]);

  function addBadge() {
    if (!badgeInput.trim()) return;
    const clean = badgeInput.trim().toUpperCase();
    if (!draft.badges.includes(clean)) {
      setDraft((prev) => ({ ...prev, badges: [...prev.badges, clean] }));
    }
    setBadgeInput('');
  }

  function removeBadge(b: string) {
    setDraft((prev) => ({ ...prev, badges: prev.badges.filter((x) => x !== b) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) {
      alert('O título do post é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      const url = isEditing
        ? `/api/v1/admin/posts/${encodeURIComponent(postId!)}`
        : '/api/v1/admin/posts';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      if (!res.ok) throw new Error('Falha ao salvar post');
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="wp-admin-page">
        <div className="wp-screen-meta-panel" style={{ textAlign: 'center', padding: '40px' }}>
          Carregando informações do post...
        </div>
      </section>
    );
  }

  return (
    <section className="wp-admin-page">
      <form onSubmit={handleSubmit}>
        {/* WordPress Screen Heading */}
        <div className="wp-screen-heading" style={{ marginBottom: '20px' }}>
          <div className="wp-screen-heading__left">
            <button
              type="button"
              className="button button-secondary"
              onClick={onBack}
              style={{ marginRight: '8px' }}
            >
              ← Voltar para Posts
            </button>
            <h1 className="wp-heading-inline">
              {isEditing ? `Editar post: ${draft.title}` : 'Adicionar novo post'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing && draft.slug && (
              <a
                className="button button-secondary"
                href={`http://localhost:3001/post/${draft.slug}`}
                rel="noreferrer"
                target="_blank"
              >
                Ver post no site ↗
              </a>
            )}
            <button
              type="submit"
              className="button button-primary"
              disabled={saving}
            >
              {saving ? 'Salvando...' : isEditing ? 'Atualizar post' : 'Publicar post'}
            </button>
          </div>
        </div>

        {/* 2-Column WordPress Layout */}
        <div className="product-editor__columns">
          {/* Main Content Column */}
          <div className="product-editor__main">
            <div className="product-editor__card">
              <div className="wp-form-field">
                <label htmlFor="post-title" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Título do post *
                </label>
                <input
                  id="post-title"
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Digite o título do post ou artigo..."
                  required
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    padding: '8px 12px',
                    height: 'auto',
                  }}
                />
              </div>

              <div className="product-editor__slug">
                <span>Slug permanente</span>
                <code>/post/{draft.slug || 'gerado-automaticamente'}</code>
                <input
                  type="text"
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  placeholder="slug-amigavel-personalizado"
                  style={{
                    height: '30px',
                    padding: '0 8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div className="wp-form-field" style={{ marginTop: '16px' }}>
                <label htmlFor="post-excerpt">Resumo / Chamada (Excerpt)</label>
                <textarea
                  id="post-excerpt"
                  rows={3}
                  value={draft.excerpt}
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                  placeholder="Breve resumo exibido nos cards da vitrine e no topo do artigo..."
                />
                <p className="wp-description">
                  O resumo é uma descrição curta opcional do post usada em destaques e buscas.
                </p>
              </div>

              <div className="wp-form-field" style={{ marginTop: '16px' }}>
                <label htmlFor="post-content">Conteúdo do artigo (HTML / Texto completo) *</label>
                <textarea
                  id="post-content"
                  rows={15}
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  placeholder="Escreva ou cole aqui o conteúdo formatado do post em HTML ou parágrafos..."
                  required
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="product-editor__aside">
            {/* Box Publicar */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Publicação</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    checked={draft.status === 'ACTIVE'}
                    onChange={() => setDraft({ ...draft, status: 'ACTIVE' })}
                  />
                  <strong style={{ color: '#00a32a' }}>Publicado</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="status"
                    checked={draft.status === 'DRAFT'}
                    onChange={() => setDraft({ ...draft, status: 'DRAFT' })}
                  />
                  <strong style={{ color: '#dba617' }}>Rascunho</strong>
                </label>
              </div>

              <div className="wp-form-field">
                <label>Nome do autor</label>
                <input
                  type="text"
                  value={draft.authorName}
                  onChange={(e) => setDraft({ ...draft, authorName: e.target.value })}
                />
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid #dcdcde' }}>
                <button
                  type="submit"
                  className="button button-primary"
                  style={{ width: '100%' }}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : isEditing ? 'Atualizar post' : 'Publicar post'}
                </button>
              </div>
            </div>

            {/* Box Categoria */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Categoria</h3>
              </div>
              <div className="wp-form-field">
                <select
                  value={draft.categoryId}
                  onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Box Badges / Tags */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Badges / Etiquetas</h3>
              </div>

              {draft.badges.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {draft.badges.map((b) => (
                    <span
                      key={b}
                      className="wp-brand-tag"
                      style={{
                        background: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                      }}
                    >
                      {b}
                      <button
                        type="button"
                        onClick={() => removeBadge(b)}
                        style={{
                          border: 0,
                          background: 'transparent',
                          color: '#b91c1c',
                          cursor: 'pointer',
                          fontWeight: 700,
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addBadge();
                    }
                  }}
                  placeholder="Ex: DELIVERY, KRAFT"
                  style={{
                    textTransform: 'uppercase',
                    height: '32px',
                    padding: '0 8px',
                    fontSize: '12px',
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={addBadge}
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Box Imagem de Capa */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Imagem de capa</h3>
              </div>

              <div className="wp-form-field">
                <input
                  type="text"
                  value={draft.coverUrl}
                  onChange={(e) => setDraft({ ...draft, coverUrl: e.target.value })}
                  placeholder="/assets/HOME Vitrine/... ou https://"
                />
              </div>

              {draft.coverUrl ? (
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '16/10',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid #dcdcde',
                    background: '#f0f0f1',
                    marginTop: '8px',
                  }}
                >
                  <img
                    src={resolveMediaUrl(draft.coverUrl)}
                    alt="Preview da capa"
                    onError={handleImageFallback}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              ) : (
                <p className="wp-description">
                  Insira o caminho ou URL da imagem de capa que será exibida no topo do artigo e nas listagens.
                </p>
              )}
            </div>

            {/* Box Vídeo Opcional */}
            <div className="product-editor__side-card">
              <div className="product-editor__side-heading">
                <h3>Vídeo (Opcional)</h3>
              </div>
              <div className="wp-form-field">
                <input
                  type="text"
                  value={draft.videoUrl}
                  onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
                <p className="wp-description">
                  Link de vídeo do YouTube ou arquivo MP4 do Explica Aí Nort.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
