export const STORAGE_KEY_INTRO_VIEWS = 'cn_nort_intro_views_v1';
export const MAX_INTRO_VIEWS = 3;

/**
 * Flag temporária de pré-lançamento:
 * false: o vídeo é sempre exibido em todas as visitas (sem limite de 3 vezes).
 * true: o vídeo respeita o limite de MAX_INTRO_VIEWS (3 vezes).
 * (Reativar como true no lançamento oficial).
 */
export const ENFORCE_INTRO_VIEW_LIMIT = false;

/**
 * Flag global de abertura automática do vídeo ao carregar o site:
 * false: o vídeo NÃO abre automaticamente ao abrir o site (desativado conforme solicitação do cliente).
 * true: o vídeo abre automaticamente ao abrir o site.
 */
export const AUTO_OPEN_INTRO_ON_SITE_LOAD = false;

let introActiveState = false;

/**
 * Define se a intro está ativamente em exibição.
 */
export function setIntroActive(active: boolean) {
  introActiveState = active;
  if (typeof window !== 'undefined') {
    (window as unknown as { __nortIntroActive?: boolean }).__nortIntroActive = active;
  }
}

/**
 * Consulta se a intro está ativamente em exibição no momento.
 */
export function isIntroActive(): boolean {
  if (typeof window !== 'undefined') {
    const globalVal = (window as unknown as { __nortIntroActive?: boolean }).__nortIntroActive;
    if (globalVal !== undefined) {
      return !!globalVal;
    }
  }
  return introActiveState;
}

/**
 * Verifica se a animação em vídeo de introdução / loading do Nort deve ser exibida.
 * - Desativada por padrão ao carregar o site a pedido do cliente.
 * - Suporta override sob demanda via query param (?intro=1 ou ?force-intro=1 ou ?reset-intro=1).
 * - Suporta parâmetro opcional autoOpenOnLoad para testes de regras de frequência.
 */
export function shouldShowNortIntro(
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null,
  enforceLimit: boolean = ENFORCE_INTRO_VIEW_LIMIT,
  autoOpenOnLoad: boolean = AUTO_OPEN_INTRO_ON_SITE_LOAD
): boolean {
  if (!storage && typeof window === 'undefined') return false;

  try {
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('skip-intro') === '1' || params.get('no-intro') === '1') {
        return false;
      }
      if (params.get('intro') === '1' || params.get('force-intro') === '1') {
        return true;
      }
      if (params.get('reset-intro') === '1') {
        storage?.removeItem(STORAGE_KEY_INTRO_VIEWS);
        return true;
      }
    }

    if (!autoOpenOnLoad) {
      return false;
    }

    if (!enforceLimit) {
      return true;
    }

    const raw = storage?.getItem(STORAGE_KEY_INTRO_VIEWS);
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
