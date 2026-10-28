import { FormEvent, useEffect, useState } from 'react';

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
        body: JSON.stringify({
          ...draft,
          categoryId: draft.categoryId || undefined,
        }),
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
      <div className="py-12 text-center text-xs text-slate-500">
        Carregando informações do post...
      </div>
    );
  }

  return (
    <form className="admin-page" onSubmit={handleSubmit}>
      {/* Top Bar estilo WordPress */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            onClick={onBack}
            type="button"
          >
            ← Voltar para Posts
          </button>
          <h1 className="text-xl font-bold text-slate-900">
            {isEditing ? `Editar Post: ${draft.title}` : 'Adicionar Novo Post'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && draft.slug ? (
            <a
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-slate-50"
              href={`http://localhost:3001/post/${draft.slug}`}
              rel="noreferrer"
              target="_blank"
            >
              Ver Post no Site ↗
            </a>
          ) : null}
          <button
            className="rounded bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? 'Salvando...' : isEditing ? 'Atualizar Post' : 'Publicar Post'}
          </button>
        </div>
      </div>

      {/* Grid de 2 Colunas (WordPress Editor Layout) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal: Título, Resumo, Conteúdo */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="post-title">
              Título do Post *
            </label>
            <input
              className="w-full rounded border border-slate-300 px-3.5 py-2.5 text-base font-bold text-slate-900 outline-none focus:border-blue-600"
              id="post-title"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Digite o título do post ou artigo..."
              required
              type="text"
              value={draft.title}
            />

            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1" htmlFor="post-slug">
                Slug Permanente (URL amigável)
              </label>
              <div className="flex items-center rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                <span className="text-slate-400">/post/</span>
                <input
                  className="w-full bg-transparent px-1 font-mono text-xs text-slate-800 outline-none"
                  id="post-slug"
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  placeholder="gerado-automaticamente"
                  type="text"
                  value={draft.slug}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="post-excerpt">
                Resumo / Chamada (Excerpt)
              </label>
              <textarea
                className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 leading-relaxed"
                id="post-excerpt"
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                placeholder="Breve resumo que aparece nos cards da vitrine e no topo do artigo..."
                rows={2}
                value={draft.excerpt}
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="post-content">
                Conteúdo do Artigo (HTML / Texto Completo) *
              </label>
              <textarea
                className="w-full font-mono rounded border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-blue-600 leading-relaxed"
                id="post-content"
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                placeholder="Escreva ou cole aqui o conteúdo formatado do post em HTML ou parágrafos..."
                required
                rows={14}
                value={draft.content}
              />
            </div>
          </div>
        </div>

        {/* Barra Lateral Direita (Inspector) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card Publicar */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Status & Visibilidade
            </h2>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  checked={draft.status === 'ACTIVE'}
                  name="status"
                  onChange={() => setDraft({ ...draft, status: 'ACTIVE' })}
                  type="radio"
                />
                <span className="font-semibold text-emerald-800">Publicado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  checked={draft.status === 'DRAFT'}
                  name="status"
                  onChange={() => setDraft({ ...draft, status: 'DRAFT' })}
                  type="radio"
                />
                <span className="font-medium text-amber-800">Rascunho</span>
              </label>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Nome do Autor
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
                onChange={(e) => setDraft({ ...draft, authorName: e.target.value })}
                type="text"
                value={draft.authorName}
              />
            </div>
          </div>

          {/* Card Categoria */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Categoria do Post
            </h2>
            <select
              className="w-full rounded border border-slate-300 p-2 text-xs text-slate-800 outline-none"
              onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
              value={draft.categoryId}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Card Badges / Etiquetas */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Badges / Etiquetas
            </h2>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {draft.badges.map((b) => (
                <span
                  className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-[#cb001c]"
                  key={b}
                >
                  {b}
                  <button
                    className="hover:text-red-900 cursor-pointer"
                    onClick={() => removeBadge(b)}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none uppercase"
                onChange={(e) => setBadgeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBadge(); } }}
                placeholder="Ex: DELIVERY, KRAFT"
                type="text"
                value={badgeInput}
              />
              <button
                className="rounded border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                onClick={addBadge}
                type="button"
              >
                +
              </button>
            </div>
          </div>

          {/* Card Imagem de Capa */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Imagem de Capa (URL)
            </h2>
            <input
              className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
              onChange={(e) => setDraft({ ...draft, coverUrl: e.target.value })}
              placeholder="/assets/HOME Vitrine/... ou https://"
              type="text"
              value={draft.coverUrl}
            />
            {draft.coverUrl ? (
              <div className="mt-2.5 overflow-hidden rounded border border-slate-200 aspect-[16/10] relative bg-slate-100">
                <img
                  alt="Preview da capa"
                  className="size-full object-cover"
                  src={draft.coverUrl}
                />
              </div>
            ) : null}
          </div>

          {/* Card Vídeo Opcional */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Vídeo (Opcional)
            </h2>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              URL do Vídeo (YouTube ou MP4)
            </label>
            <input
              className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-800 outline-none"
              onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
              placeholder="https://youtube.com/..."
              type="text"
              value={draft.videoUrl}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
