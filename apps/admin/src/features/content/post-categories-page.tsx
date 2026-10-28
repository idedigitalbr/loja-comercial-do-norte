import { FormEvent, useEffect, useState } from 'react';

type PostCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { posts: number };
};

export function PostCategoriesPage({ onBack }: { onBack: () => void }) {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/posts/categories', { credentials: 'include' });
      if (res.ok) {
        setCategories(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/posts/categories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() || undefined, description: description.trim() || undefined }),
      });
      if (!res.ok) throw new Error('Erro ao criar categoria');
      setName('');
      setSlug('');
      setDescription('');
      loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, catName: string) {
    if (!window.confirm(`Deseja excluir a categoria "${catName}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/posts/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir categoria');
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <div className="admin-page">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            onClick={onBack}
            type="button"
          >
            ← Voltar para Posts
          </button>
          <h1 className="text-xl font-bold text-slate-900">Categorias de Posts</h1>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Formulário (Coluna Esquerda) */}
        <form className="md:col-span-5 rounded-lg border border-slate-200 bg-white p-5 shadow-xs" onSubmit={handleSubmit}>
          <h2 className="text-sm font-bold text-slate-900 mb-3">Adicionar nova categoria</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="cat-name">
                Nome *
              </label>
              <input
                className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                id="cat-name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Embalagens & Delivery"
                required
                type="text"
                value={name}
              />
              <p className="mt-1 text-[10px] text-slate-400">O nome é como aparece no site.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="cat-slug">
                Slug (opcional)
              </label>
              <input
                className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                id="cat-slug"
                onChange={(e) => setSlug(e.target.value)}
                placeholder="embalagens-delivery"
                type="text"
                value={slug}
              />
              <p className="mt-1 text-[10px] text-slate-400">Versão amigável para URL.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="cat-desc">
                Descrição
              </label>
              <textarea
                className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                id="cat-desc"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição da categoria..."
                rows={3}
                value={description}
              />
            </div>

            <button
              className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving ? 'Adicionando...' : 'Adicionar nova categoria'}
            </button>
          </div>
        </form>

        {/* Tabela de Categorias (Coluna Direita) */}
        <div className="md:col-span-7 rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-900">
              <tr>
                <th className="py-2.5 px-3">Nome</th>
                <th className="py-2.5 px-3">Descrição</th>
                <th className="py-2.5 px-3">Slug</th>
                <th className="py-2.5 px-3 text-center">Itens</th>
                <th className="py-2.5 pr-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="py-6 text-center text-slate-400" colSpan={5}>Carregando...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td className="py-6 text-center text-slate-400" colSpan={5}>Nenhuma categoria cadastrada.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr className="hover:bg-slate-50 transition" key={cat.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-[200px] truncate">{cat.description || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{cat.slug}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-600">{cat._count?.posts || 0}</td>
                    <td className="py-2.5 pr-3 text-right">
                      <button
                        className="text-red-600 hover:underline cursor-pointer"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        type="button"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
