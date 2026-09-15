import { FormEvent, useEffect, useMemo, useState } from 'react';

type TaxonomyItem = { id: string; name: string; slug: string; status: string; parentId?: string | null; parent?: { name: string } | null };
type TreeItem = TaxonomyItem & { depth: number };

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function flatten(items: TaxonomyItem[]): TreeItem[] {
  const children = new Map<string | null, TaxonomyItem[]>();
  for (const item of items) children.set(item.parentId ?? null, [...(children.get(item.parentId ?? null) ?? []), item]);
  for (const list of children.values()) list.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  const result: TreeItem[] = [];
  function visit(parentId: string | null, depth: number) {
    for (const item of children.get(parentId) ?? []) {
      result.push({ ...item, depth });
      visit(item.id, depth + 1);
    }
  }
  visit(null, 0);
  return result;
}

export function TaxonomyManager({ kind, items, onReload, onOpenBrand, onCreateBrand }: { kind: 'brands' | 'categories'; items: TaxonomyItem[]; onReload: () => Promise<void>; onOpenBrand?: (id: string) => void; onCreateBrand?: () => void }) {
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);
  const singular = kind === 'brands' ? 'marca' : 'categoria';
  const tree = useMemo(() => flatten(items), [items]);
  const rootOptions = items.filter((item) => !item.parentId && item.id !== editing?.id);
  const usesDedicatedBrandPage = kind === 'brands' && Boolean(onOpenBrand);

  useEffect(() => {
    setName(editing?.name ?? ''); setSlug(editing?.slug ?? ''); setParentId(editing?.parentId ?? '');
  }, [editing]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const body = { name, slug: slug || slugify(name), ...(kind === 'brands' ? { parentId: parentId || undefined } : {}) };
      const response = await fetch(editing ? `/api/v1/admin/catalog/${kind}/${editing.id}` : `/api/v1/admin/catalog/${kind}`, { method: editing ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error('Não foi possível salvar a taxonomia.');
      setEditing(null); setName(''); setSlug(''); setParentId(''); await onReload();
    } finally {
      setSaving(false);
    }
  }

  async function archive(item: TaxonomyItem) {
    if (!window.confirm(`Arquivar ${singular} “${item.name}”?`)) return;
    await fetch(`/api/v1/admin/catalog/${kind}/${item.id}/archive`, { method: 'POST', credentials: 'include' });
    await onReload();
  }

  return <div className="admin-taxonomy">
    {usesDedicatedBrandPage ? <div className="admin-card admin-toolbar"><div><strong>Marcas e submarcas</strong><span>Abra o cadastro completo para editar identidade, mídia e produtos vinculados.</span></div><button className="admin-button admin-button--compact" type="button" onClick={onCreateBrand}>Nova marca</button></div> : <div className="admin-card admin-taxonomy__form"><div className="admin-section-title"><div><p className="admin-eyebrow">Taxonomia do catálogo</p><h3>{editing ? `Editar ${singular}` : `Nova ${singular}`}</h3><span className="admin-help">Marcas principais podem receber submarcas para organizar linhas e filtros.</span></div></div><form className="admin-form-grid admin-form-grid--three" onSubmit={submit}><label>Nome<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Slug<input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="gerado automaticamente" /></label>{kind === 'brands' ? <label>Marca principal<select value={parentId} onChange={(event) => setParentId(event.target.value)}><option value="">Nenhuma — marca principal</option>{rootOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label> : null}<div className="admin-form-actions"><button className="admin-button admin-button--compact" type="submit" disabled={saving}>{saving ? 'Salvando…' : editing ? 'Atualizar' : 'Adicionar'}</button>{editing ? <button className="admin-button admin-button--quiet admin-button--compact" type="button" onClick={() => setEditing(null)}>Cancelar</button> : null}</div></form></div>}
    <div className="admin-card admin-table-card"><div className="admin-section-title"><div><p className="admin-eyebrow">{kind === 'brands' ? 'Marcas e submarcas' : 'Categorias'}</p><h3>{items.length} registros</h3></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Nome</th><th>Slug</th><th>Status</th><th /></tr></thead><tbody>{tree.map((item) => <tr key={item.id} className={item.depth ? 'taxonomy-row--child' : ''}><td><strong style={{ paddingLeft: `${item.depth * 22}px` }}>{item.depth ? '↳ ' : ''}{item.name}</strong>{item.depth ? <small className="admin-table__subline" style={{ paddingLeft: `${item.depth * 22 + 20}px` }}>Submarca de {item.parent?.name ?? items.find((parent) => parent.id === item.parentId)?.name ?? 'marca principal'}</small> : <small className="admin-table__subline">Marca principal</small>}</td><td className="admin-muted-cell">{item.slug}</td><td><span className={`admin-status admin-status--${item.status.toLowerCase()}`}>{item.status}</span></td><td className="admin-table__actions"><button className="admin-link-button" type="button" onClick={() => usesDedicatedBrandPage ? onOpenBrand?.(item.id) : setEditing(item)}>Editar</button>{item.status !== 'ARCHIVED' ? <button className="admin-link-button admin-link-button--danger" type="button" onClick={() => void archive(item)}>Arquivar</button> : null}</td></tr>)}</tbody></table>{!items.length ? <p className="admin-empty">Nenhum registro cadastrado.</p> : null}</div></div>
  </div>;
}
