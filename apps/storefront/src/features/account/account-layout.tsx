import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Icon } from '@commerce/ui';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AccountApiError, AccountSummary, accountApi } from './account-client';

type AccountContextValue = { summary: AccountSummary; refresh: () => Promise<void> };
const AccountContext = createContext<AccountContextValue | null>(null);

const accountNavigation = [
  { href: '/conta', label: 'Visão geral', icon: 'layout-dashboard' as const },
  { href: '/conta/pedidos', label: 'Meus pedidos', icon: 'package' as const },
  { href: '/conta/dados', label: 'Meus dados', icon: 'user' as const },
  { href: '/conta/enderecos', label: 'Meus endereços', icon: 'map-pin' as const },
  { href: '/conta/favoritos', label: 'Meus favoritos', icon: 'heart' as const },
  { href: '/conta/seguranca', label: 'Segurança', icon: 'shield-check' as const },
];

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount deve ser usado dentro de AccountLayout.');
  return context;
}

function isActiveRoute(pathname: string, href: string) {
  return href === '/conta' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSummary(await accountApi.summary());
    } catch (cause) {
      if (cause instanceof AccountApiError && cause.status === 401) {
        const returnTo = `${location.pathname}${location.search}`;
        navigate(`/entrar?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
        return;
      }
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar sua conta.');
    } finally {
      setLoading(false);
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { document.title = `${title} — Jonas & Elivaldo`; }, [title]);

  const contextValue = useMemo(() => summary ? { summary, refresh } : null, [refresh, summary]);
  if (!summary && loading) return <AccountLoading />;
  if (!summary && error) return <AccountError message={error} onRetry={() => void refresh()} />;
  if (!summary) return null;

  return (
    <AccountContext.Provider value={contextValue!}>
      <main className="page-section account-area">
        <div className="site-container">
          <div className="account-heading">
            <div>
              <p className="eyebrow">Área do cliente</p>
              <h1>{title}</h1>
            </div>
            <div className="account-heading__copy">
              <p>{description}</p>
              <Link className="account-heading__shop-link" to="/loja"><Icon name="arrow-left" size={16} strokeWidth={1.8} />Continuar comprando</Link>
            </div>
          </div>
          <div className="account-layout">
            <aside className="account-sidebar" aria-label="Navegação da conta">
              <div className="account-sidebar__identity">
                <span className="account-avatar" aria-hidden="true">{(summary.user.profile?.firstName?.[0] ?? summary.user.email[0]).toUpperCase()}</span>
                <div><strong>{summary.user.profile?.firstName || 'Cliente'}</strong><span>{summary.user.email}</span></div>
              </div>
              <nav className="account-nav">
                {accountNavigation.map((item) => <Link className={isActiveRoute(location.pathname, item.href) ? 'is-active' : undefined} aria-current={isActiveRoute(location.pathname, item.href) ? 'page' : undefined} key={item.href} to={item.href}><Icon name={item.icon} size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.href === '/conta/pedidos' && summary.metrics.orderCount ? <b>{summary.metrics.orderCount}</b> : null}</Link>)}
              </nav>
              <div className="account-sidebar__support"><span>Precisa de ajuda?</span><a href="https://wa.me/5596981001897" target="_blank" rel="noreferrer"><Icon name="message-circle" size={16} strokeWidth={1.8} />Falar no WhatsApp</a></div>
            </aside>
            <div className="account-content">{children}</div>
          </div>
        </div>
      </main>
    </AccountContext.Provider>
  );
}

export function AccountLoading() {
  return <main className="page-section account-area"><div className="site-container"><div className="account-state account-state--loading" role="status" aria-live="polite"><span className="account-spinner" aria-hidden="true" />Carregando sua conta…</div></div></main>;
}

export function AccountError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <main className="page-section account-area"><div className="site-container"><div className="account-state account-state--error" role="alert"><Icon name="circle-alert" size={22} strokeWidth={1.8} /><div><strong>Não foi possível carregar sua conta</strong><p>{message}</p><button className="button button--secondary" type="button" onClick={onRetry}>Tentar novamente</button></div></div></div></main>;
}
