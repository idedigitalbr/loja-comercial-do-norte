import { FormEvent, useEffect, useMemo, useState } from 'react';
import { brandProductSummary, slugifyBrandName } from './brand-editor-utils';

type BrandOption = { id: string; name: string; parentId?: string | null };
type BrandProduct = { id: string; name: string; slug: string; status: string; variants?: Array<{ sku: string; priceCents: number }>; images?: Array<{ path: string; altText?: string | null }> };
type BrandChild = { id: string; name: string; slug: string; status: string; imagePath?: string | null; _count?: { products: number } };
type BrandDetail = BrandOption & { slug: string; description?: string | null; imagePath?: string | null; status: string; parent?: BrandOption | null; children: BrandChild[]; products: BrandProduct[]; _count: { products: number; children: number } };
type BrandDraft = { name: string; slug: string; description: string; parentId: string; imagePath: string };

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Não foi possível carregar os dados da marca.');
  return response.json() as Promise<T>;
}

function formatCurrency(cents = 0) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function emptyDraft(parentId = ''): BrandDraft {
  return { name: '', slug: '', description: '', parentId, imagePath: '' };
}

function draftFromBrand(brand: BrandDetail): BrandDraft {
  return { name: brand.name, slug: brand.slug, description: brand.description ?? '', parentId: brand.parentId ?? '', imagePath: brand.imagePath ?? '' };
}

export function BrandEditorPage({ brandId, initialParentId = '', onBack, onOpenBrand, onCreateChild }: { brandId?: string; initialParentId?: string; onBack: () => void; onOpenBrand: (id: string) => void; onCreateChild: (parentId: string) => void }) {
  const [brand, setBrand] = useState<BrandDetail | null>(null);
  const [roots, setRoots] = useState<BrandOption[]>([]);
  const [draft, setDraft] = useState<BrandDraft>(() => emptyDraft(initialParentId));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [brandList, detail] = await Promise.all([
        getJson<BrandOption[]>('/api/v1/admin/catalog/brands'),
        brandId ? getJson<BrandDetail>(`/api/v1/admin/catalog/brands/${brandId}`) : Promise.resolve(null),
      ]);
      setRoots(brandList.filter((item) => !item.parentId && item.id !== brandId));
      setBrand(detail);
      setDraft(detail ? draftFromBrand(detail) : emptyDraft(initialParentId));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar a marca.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [brandId, initialParentId]);

  const summary = useMemo(() => brandProductSummary(brand?.products ?? []), [brand]);
  const isSubbrand = Boolean(draft.parentId);
  const slug = slugifyBrandName(draft.name);

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', draft.name);
      const response = await fetch('/api/v1/admin/media/brand-images', { method: 'POST', credentials: 'include', body: formData });
      const payload = await response.json().catch(() => null) as { path?: string; altText?: string; message?: string } | null;
      if (!response.ok || !payload?.path) throw new Error(payload?.message ?? 'Não foi possível enviar a imagem da marca.');
      setDraft((current) => ({ ...current, imagePath: payload.path ?? '' }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { name: draft.name, slug, description: draft.description, parentId: draft.parentId || undefined, imagePath: isSubbrand ? undefined : draft.imagePath || undefined };
      const response = await fetch(brandId ? `/api/v1/admin/catalog/brands/${brandId}` : '/api/v1/admin/catalog/brands', { method: brandId ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => null) as { id?: string; message?: string } | null;
      if (!response.ok) throw new Error(result?.message ?? 'Não foi possível salvar a marca.');
      setMessage(brandId ? 'Marca atualizada.' : 'Marca criada.');
      if (!brandId && result?.id) onOpenBrand(result.id);
      else await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível salvar a marca.');
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!brandId || !window.confirm(`Arquivar a marca “${draft.name}”?`)) return;
    const response = await fetch(`/api/v1/admin/catalog/brands/${brandId}/archive`, { method: 'POST', credentials: 'include' });
    if (!response.ok) { setError('Não foi possível arquivar a marca.'); return; }
    setMessage('Marca arquivada.'); await load();
  }

  return <section className="admin-page admin-brand-page">
    <nav className="product-editor__breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={onBack}>Catálogo</button><span>›</span><button type="button" onClick={onBack}>Marcas</button><span>›</span><strong>{brandId ? 'Editar marca' : 'Nova marca'}</strong></nav>
    <div className="admin-page__heading product-editor__page-heading"><div><p className="admin-eyebrow">WooCommerce / catálogo</p><h2>{brandId ? 'Editar marca' : 'Nova marca'}</h2></div><p>Organize a identidade da marca, suas linhas e os produtos vinculados.</p></div>
    {message ? <p className="admin-success" role="status">{message}</p> : null}{error ? <p className="admin-error" role="alert">{error}</p> : null}
    {loading ? <div className="admin-card admin-empty-state"><p>Carregando marca…</p></div> : <form className="brand-editor" onSubmit={submit}>
      <div className="brand-editor__columns"><div className="brand-editor__main">
        <section className="admin-card brand-editor__card"><div className="product-editor__section-heading"><div><p className="admin-eyebrow">Dados editoriais</p><h3>Identidade da marca</h3></div><span className="product-editor__status">{draft.parentId ? 'Submarca' : 'Marca principal'}</span></div><label className="product-editor__label">Nome<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} required autoFocus /></label><div className="product-editor__slug"><span>Slug automático</span><code>/{slug || 'nome-da-marca'}</code><small>Gerado a partir do nome e atualizado ao salvar.</small></div><label className="product-editor__label">Descrição<textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} rows={6} placeholder="Apresente a marca e sua linha profissional." /></label></section>
        <section className="admin-card brand-editor__card"><div className="product-editor__section-heading"><div><p className="admin-eyebrow">Hierarquia</p><h3>Marca principal e submarcas</h3></div></div><label className="product-editor__label">Marca principal<select value={draft.parentId} onChange={(event) => setDraft((current) => ({ ...current, parentId: event.target.value, imagePath: event.target.value ? '' : current.imagePath }))}><option value="">Nenhuma — marca principal</option>{roots.map((root) => <option key={root.id} value={root.id}>{root.name}</option>)}</select></label><p className="admin-help">Somente marcas principais recebem imagem. Submarcas aparecem indentadas nos filtros e usam a identidade da marca-mãe.</p></section>
        {brandId ? <section className="admin-card brand-editor__card"><div className="product-editor__section-heading"><div><p className="admin-eyebrow">Linhas da marca</p><h3>Submarcas</h3></div><button className="admin-button admin-button--outline admin-button--compact" type="button" onClick={() => onCreateChild(brandId)}>Nova submarca</button></div>{brand?.children.length ? <div className="brand-editor__children">{brand.children.map((child) => <div className="brand-editor__child" key={child.id}><div><strong>{child.name}</strong><small>{child._count?.products ?? 0} produtos · {child.slug}</small></div><button className="admin-link-button" type="button" onClick={() => onOpenBrand(child.id)}>Editar</button></div>)}</div> : <p className="admin-empty">Nenhuma submarca vinculada.</p>}</section> : null}
        {brandId ? <section className="admin-card admin-table-card brand-editor__products"><div className="product-editor__section-heading"><div><p className="admin-eyebrow">Catálogo vinculado</p><h3>Produtos cadastrados</h3></div></div>{brand?.products.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produto</th><th>SKU</th><th>Preço</th><th>Status</th></tr></thead><tbody>{brand.products.map((product) => <tr key={product.id}><td><strong>{product.name}</strong><small className="admin-table__subline">/{product.slug}</small></td><td>{product.variants?.[0]?.sku ?? 'Sem SKU'}</td><td>{formatCurrency(product.variants?.[0]?.priceCents)}</td><td><span className={`admin-status admin-status--${product.status.toLowerCase()}`}>{product.status}</span></td></tr>)}</tbody></table></div> : <p className="admin-empty">Nenhum produto vinculado a esta marca.</p>}</section> : null}
      </div><aside className="brand-editor__aside">
        <section className="admin-card brand-editor__card"><div className="product-editor__section-heading"><div><p className="admin-eyebrow">Mídia principal</p><h3>Imagem da marca</h3></div></div>{isSubbrand ? <p className="admin-help">A imagem é definida somente na marca principal.</p> : <><label className="brand-editor__media-upload"><span>{uploading ? 'Enviando…' : draft.imagePath ? 'Trocar imagem' : 'Selecionar imagem'}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { void uploadImage(event.target.files?.[0]); event.currentTarget.value = ''; }} /></label><div className="brand-editor__image-preview">{draft.imagePath ? <img src={draft.imagePath} alt={draft.name || 'Prévia da marca'} /> : <span>Imagem quadrada<br />800 × 800</span>}</div><p className="admin-help">JPG, PNG ou WebP. A imagem será recortada no servidor para um formato quadrado.</p></>}</section>
        {brandId ? <section className="admin-card brand-editor__card"><p className="admin-eyebrow">Resumo do catálogo</p><div className="brand-editor__stats"><div><strong>{summary.total}</strong><span>Produtos</span></div><div><strong>{summary.active}</strong><span>Ativos</span></div><div><strong>{summary.drafts}</strong><span>Rascunhos</span></div><div><strong>{summary.archived}</strong><span>Arquivados</span></div></div></section> : null}
        <section className="admin-card brand-editor__card"><p className="admin-eyebrow">Ações</p><div className="brand-editor__actions"><button className="admin-button" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar marca'}</button><button className="admin-button admin-button--quiet" type="button" onClick={onBack}>Cancelar</button>{brandId && brand?.status !== 'ARCHIVED' ? <button className="admin-link-button admin-link-button--danger" type="button" onClick={() => void archive()}>Arquivar marca</button> : null}</div></section>
      </aside></div>
    </form>}
  </section>;
}
