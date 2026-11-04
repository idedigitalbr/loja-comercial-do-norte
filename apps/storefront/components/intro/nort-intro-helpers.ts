export const STORAGE_KEY_INTRO_VIEWS = 'cn_nort_intro_views_v1';
export const MAX_INTRO_VIEWS = 3;

/**
 * Verifica se a animação em vídeo de introdução / loading do Nort deve ser exibida.
 * - Exibida pelas primeiras 3 vezes (visitas/cargas de página).
 * - Suporta override via query param (?intro=1 ou ?force-intro=1 ou ?reset-intro=1).
 */
export function shouldShowNortIntro(
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null
): boolean {
  if (!storage) return false;

  try {
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('intro') === '1' || params.get('force-intro') === '1') {
        return true;
      }
      if (params.get('reset-intro') === '1') {
        storage.removeItem(STORAGE_KEY_INTRO_VIEWS);
        return true;
      }
    }

    const raw = storage.getItem(STORAGE_KEY_INTRO_VIEWS);
    if (raw === null || raw === undefined) return true;
    const count = parseInt(raw, 10);
    if (Number.isNaN(count)) return true;
    return count < MAX_INTRO_VIEWS;
  } catch {
    return false;
  }
}

/**
 * Registra a exibição da introdução, incrementando o contador no localStorage.
 * Retorna a nova contagem de visualizações.
 */
export function recordNortIntroView(
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null
): number {
  if (!storage) return 0;

  try {
    const raw = storage.getItem(STORAGE_KEY_INTRO_VIEWS);
    const count = raw ? parseInt(raw, 10) : 0;
    const nextCount = (Number.isNaN(count) ? 0 : count) + 1;
    storage.setItem(STORAGE_KEY_INTRO_VIEWS, String(nextCount));
    return nextCount;
  } catch {
    return 0;
  }
}
