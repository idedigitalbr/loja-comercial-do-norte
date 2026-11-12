'use client';

export function resolveAdminPanelUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5174/admin/').trim();
  if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
    try {
      const parsed = new URL(configured);
      if (parsed.hostname === 'localhost') {
        parsed.hostname = '127.0.0.1';
        return parsed.href;
      }
    } catch {
      // Preserva a URL original caso não seja absoluta
    }
  }
  return configured;
}

export async function buildAdminUrlWithHandoff(baseUrl = resolveAdminPanelUrl()): Promise<string> {
  const cleanBase = baseUrl.split('#')[0];
  try {
    const response = await fetch('/api/v1/auth/admin-handoff', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
    if (response.ok) {
      const data = (await response.json()) as { code?: string };
      if (data?.code) {
        return `${cleanBase}#handoff=${encodeURIComponent(data.code)}`;
      }
    }
  } catch {
    // Fallback para navegação direta (ex.: mesma origem em localhost ou testes)
  }
  return cleanBase;
}

export async function openAdminPanel({ newTab = true }: { newTab?: boolean } = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  const baseUrl = resolveAdminPanelUrl();
  const popup = newTab ? window.open('about:blank', '_blank') : null;

  const targetUrl = await buildAdminUrlWithHandoff(baseUrl);
  if (popup && !popup.closed) {
    try {
      popup.opener = null;
    } catch {
      // Ignora restrições de ambiente em testes/jsdom
    }
    popup.location.replace(targetUrl);
    return;
  }

  window.location.href = targetUrl;
}
