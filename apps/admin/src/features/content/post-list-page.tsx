import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Icon } from '@commerce/ui';

type PostCategory = { id: string; name: string; slug: string };

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverUrl?: string | null;
  videoUrl?: string | null;
  authorName?: string | null;
  badges: string[];
  status: string;
  publishedAt: string;
  views: number;
  category?: PostCategory | null;
  createdAt: string;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Não foi possível carregar os dados.');
  return response.json() as Promise<T>;
}

export function PostListPage({
  onCreate,
  onEdit,
  onManageCategories,
  onNavigate,
}: {
  onCreate: () => void;
  onEdit: (id: string) => void;
  onManageCategories: () => void;
  onNavigate: (path: string) => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'DRAFT'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [postRes, catRes] = await Promise.all([
        getJson<{ items: Post[] }>('/api/v1/admin/posts?pageSize=100'),
        getJson<PostCategory[]>('/api/v1/admin/posts/categories'),
      ]);
      setPosts(postRes.items || []);
      setCategories(catRes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Deseja realmente excluir o post "${title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir post');
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  const counts = useMemo(() => {
    return {
      all: posts.length,
      published: posts.filter((p) => p.status === 'ACTIVE').length,
      draft: posts.filter((p) => p.status === 'DRAFT').length,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter === 'ACTIVE' && p.status !== 'ACTIVE') return false;
      if (statusFilter === 'DRAFT' && p.status !== 'DRAFT') return false;
      if (categoryFilter && p.category?.id !== categoryFilter) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesExcerpt = p.excerpt?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesExcerpt) return false;
      }
      return true;
    });
  }, [posts, statusFilter, categoryFilter, search]);

  return (
    <div className="admin-page">
      {/* WordPress Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Posts</h1>
          <button
            className="rounded border border-blue-600 bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
            onClick={onCreate}
            type="button"
          >
            Adicionar Novo
          </button>
          <button
            className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            onClick={onManageCategories}
            type="button"
          >
            Categorias de Post
          </button>
        </div>

        {/* Busca */}
        <div className="flex items-center gap-2">
          <input
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar posts..."
            type="search"
            value={search}
          />
        </div>
      </div>

      {/* WordPress Status Views */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <button
          className={`cursor-pointer ${statusFilter === 'all' ? 'font-bold text-blue-700 underline' : 'hover:text-slate-800'}`}
          onClick={() => setStatusFilter('all')}
          type="button"
        >
          Tudo <span className="text-slate-400">({counts.all})</span>
        </button>
        <span>|</span>
        <button
          className={`cursor-pointer ${statusFilter === 'ACTIVE' ? 'font-bold text-blue-700 underline' : 'hover:text-slate-800'}`}
          onClick={() => setStatusFilter('ACTIVE')}
          type="button"
        >
          Publicados <span className="text-slate-400">({counts.published})</span>
        </button>
        <span>|</span>
        <button
          className={`cursor-pointer ${statusFilter === 'DRAFT' ? 'font-bold text-blue-700 underline' : 'hover:text-slate-800'}`}
          onClick={() => setStatusFilter('DRAFT')}
          type="button"
        >
          Rascunhos <span className="text-slate-400">({counts.draft})</span>
        </button>
      </div>

      {/* Filtro de Categoria */}
      <div className="mt-3 flex items-center gap-3">
        <select
          className="rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 outline-none"
          onChange={(e) => setCategoryFilter(e.target.value)}
          value={categoryFilter}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          className="rounded border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          onClick={() => { setCategoryFilter(''); setSearch(''); }}
          type="button"
        >
          Limpar filtros
        </button>
      </div>

      {/* Tabela de Posts */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-900">
            <tr>
              <th className="py-2.5 pl-4 pr-2 w-12">Capa</th>
              <th className="py-2.5 px-3">Título</th>
              <th className="py-2.5 px-3">Autor</th>
              <th className="py-2.5 px-3">Categoria</th>
              <th className="py-2.5 px-3">Badges</th>
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 pr-4 pl-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="py-8 text-center text-slate-400" colSpan={7}>
                  Carregando posts...
                </td>
              </tr>
            ) : filteredPosts.length === 0 ? (
              <tr>
                <td className="py-8 text-center text-slate-400" colSpan={7}>
                  Nenhum post encontrado.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr className="hover:bg-slate-50/80 transition group" key={post.id}>
                  <td className="py-2.5 pl-4 pr-2">
                    {post.coverUrl ? (
                      <img
                        alt={post.title}
                        className="h-10 w-14 rounded object-cover border border-slate-200"
                        src={post.coverUrl}
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded bg-slate-100 text-[10px] text-slate-400">
                        Sem capa
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <button
                      className="text-left font-bold text-blue-600 hover:underline cursor-pointer"
                      onClick={() => onEdit(post.id)}
                      type="button"
                    >
                      {post.title}
                    </button>
                    {post.status === 'DRAFT' ? (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase">
                        Rascunho
                      </span>
                    ) : null}
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 opacity-80 group-hover:opacity-100">
                      <button
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => onEdit(post.id)}
                        type="button"
                      >
                        Editar
                      </button>
                      <span>|</span>
                      <button
                        className="text-red-600 hover:underline cursor-pointer"
                        onClick={() => handleDelete(post.id, post.title)}
                        type="button"
                      >
                        Excluir
                      </button>
                      <span>|</span>
                      <a
                        className="text-emerald-700 hover:underline"
                        href={`http://localhost:3001/post/${post.slug}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Ver no site ↗
                      </a>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {post.authorName || 'Comercial do Norte'}
                  </td>
                  <td className="py-2.5 px-3">
                    {post.category ? (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {post.badges.map((b, i) => (
                        <span className="rounded bg-red-50 border border-red-200 px-1.5 py-0.2 text-[9px] font-bold text-[#cb001c]" key={i}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-500">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-2.5 pr-4 pl-2 text-right">
                    <button
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      onClick={() => onEdit(post.id)}
                      type="button"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
