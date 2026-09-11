import { FormEvent, useState } from 'react';

export type ProductDraft = {
  name: string;
  slug: string;
  description?: string;
};

export function ProductForm({ onSave }: { onSave: (draft: ProductDraft) => Promise<void> }) {
  const [draft, setDraft] = useState<ProductDraft>({ name: '', slug: '', description: '' });
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        Nome
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
      </label>
      <label>
        Slug
        <input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} required />
      </label>
      <label>
        Descrição
        <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      </label>
      <button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar produto'}</button>
    </form>
  );
}
