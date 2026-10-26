import { useEffect, useState } from 'react';

type AuthenticatedUser = { email?: string; roles?: string[] };

export function getStorefrontLoginUrl(origin = window.location.origin): string {
  const configuredUrl = (import.meta.env.VITE_STOREFRONT_URL as string | undefined)?.trim();
  const storefrontOrigin = configuredUrl || origin.replace(':5174', ':3001');
  return new URL('/login', storefrontOrigin).href;
}

export function LoginPage({ onAuthenticated }: { onAuthenticated: (email: string) => void }) {
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const loginUrl = getStorefrontLoginUrl();

  useEffect(() => {
    let active = true;
    setError('');

    async function checkSession() {
      try {
        const response = await fetch('/api/v1/auth/me', { credentials: 'include' });
        if (!active) return;
        if (response.status === 401) {
          window.location.replace(loginUrl);
          return;
        }
        if (!response.ok) throw new Error('Não foi possível verificar sua sessão. Tente novamente.');
        const payload = (await response.json()) as { user?: AuthenticatedUser };
        if (!active) return;
        if (payload.user?.email && payload.user.roles?.includes('ADMIN')) {
          onAuthenticated(payload.user.email);
        } else if (payload.user?.email) {
          setError('Esta conta não possui acesso ao painel administrativo.');
        } else {
          window.location.replace(loginUrl);
        }
      } catch {
        if (active) setError('Não foi possível verificar sua sessão. Tente novamente.');
      }
    }

    void checkSession();
    return () => { active = false; };
  }, [onAuthenticated, loginUrl, attempt]);

  return (
    <main className="admin-shell">
      <section className="admin-card" aria-label="Acesso ao painel">
        <p className="admin-eyebrow">Comercial do Norte</p>
        {error ? (
          <>
            <p className="admin-error" role="alert">{error}</p>
            <a className="admin-button" href={loginUrl}>Ir para o login</a>
            <button className="admin-button admin-button--quiet" type="button" onClick={() => setAttempt((value) => value + 1)}>
              Tentar novamente
            </button>
          </>
        ) : <p role="status">Verificando sua sessão…</p>}
      </section>
    </main>
  );
}
