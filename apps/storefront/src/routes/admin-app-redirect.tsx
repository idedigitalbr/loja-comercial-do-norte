import { useEffect } from 'react';

type AdminRuntimeEnv = {
  DEV?: boolean;
  VITE_ADMIN_URL?: string;
};

export function getAdminAppUrl(env: AdminRuntimeEnv = import.meta.env, origin = window.location.origin): string {
  const configuredUrl = env.VITE_ADMIN_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '') + '/';
  return env.DEV ? 'http://localhost:5174/admin/' : `${origin.replace(/\/+$/, '')}/admin/`;
}

export function AdminAppRedirect() {
  const target = getAdminAppUrl();

  useEffect(() => {
    if (window.location.href !== target) window.location.replace(target);
  }, [target]);

  return (
    <main className="page-section app-redirect-page">
      <div className="site-container">
        <div className="account-state account-state--inline" role="status" aria-live="polite">
          Redirecionando para o painel administrativo…
        </div>
      </div>
    </main>
  );
}
