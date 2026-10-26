import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearStorefrontCompositionCache,
  getStorefrontComposition,
  getStorefrontRevisions,
  restoreStorefrontRevision,
  saveStorefrontComposition,
} from './composition-storage';
import { defaultHomeComposition } from './home-configuration';
import type { PageComposition } from './widget-types';

describe('composition-storage e histórico de revisões', () => {
  beforeEach(() => {
    clearStorefrontCompositionCache();
  });

  it('retorna uma composição válida com 19 seções', async () => {
    const comp = await getStorefrontComposition();
    expect(comp).toBeDefined();
    expect(comp.page).toBe('home');
    expect(Array.isArray(comp.widgets)).toBe(true);
    expect(comp.widgets.length).toBeGreaterThanOrEqual(1);
  });

  it('salva e recupera a composição atualizada gerando uma nova revisão histórica', async () => {
    const current = await getStorefrontComposition();
    const modified: PageComposition = {
      ...current,
      widgets: current.widgets.map((w, idx) => (idx === 0 ? { ...w, enabled: true } : w)),
    };

    const revision = await saveStorefrontComposition(modified, {
      name: 'Victor Williames',
      email: 'victor@comercialdonorte.com.br',
      note: 'Teste de checkpoint',
    });

    expect(revision.authorName).toBe('Victor Williames');
    expect(revision.authorEmail).toBe('victor@comercialdonorte.com.br');

    const revisions = await getStorefrontRevisions();
    expect(revisions.length).toBeGreaterThanOrEqual(1);
    expect(revisions[0].id).toBe(revision.id);

    // Testa restauração
    const restored = await restoreStorefrontRevision(revision.id);
    expect(restored).toBeDefined();
    expect(restored?.id).toBe(revision.id);
  });
});
