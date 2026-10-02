import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@commerce/ui';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { institutionalContent } from '../content/institutional-content';
import { loadSiteConfig, resolveSiteContent, SiteConfigContext, type PublicSiteConfig } from '../content/site-config-client';
import { CART_UPDATED_EVENT, getCart, getOrCreateCart } from '../features/cart/cart-client';
import { CartDrawer } from '../features/cart/cart-drawer';
import { AUTH_UPDATED_EVENT, getCurrentUser, logout, type AuthUser } from '../features/account/auth-client';
import { SiteLanguageSwitcher } from './site-language-switcher';

const whatsappBrandPath = 'M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z';

function WhatsAppBrandIcon({ size }: { size: number }) {
  return (
    <svg className="icon whatsapp-brand-icon" width={size} height={size} viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" focusable="false" data-icon="whatsapp">
      <path d={whatsappBrandPath} />
    </svg>
  );
}

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Sobre nós', href: '/sobre-nos' },
  {
    label: 'Serviços',
    href: '/servicos',
    children: [
      { label: 'Cabelos e Penteados', href: '/cabelos-e-penteados' },
      { label: 'Maquiagem', href: '/maquiagem' },
      { label: 'Manicure & Pedicure', href: '/manicure-pedicure' },
      { label: 'Terapia Capilar', href: '/terapia-capilar' },
    ],
  },
  { label: 'Loja', href: '/loja' },
  { label: 'Certificação internacional', href: '/certificacao-internacional' },
];

export function isNavigationItemActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function isNavigationEntryActive(pathname: string, item: (typeof navigation)[number]) {
  return isNavigationItemActive(pathname, item.href) || Boolean(item.children?.some((child) => isNavigationItemActive(pathname, child.href)));
}

export function StorefrontShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [siteConfig, setSiteConfig] = useState<PublicSiteConfig | null>(null);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartOpening, setCartOpening] = useState(false);
  const [cartPublicId, setCartPublicId] = useState<string | null>(() => window.localStorage.getItem('je_cart_public_id'));
  const [cartCount, setCartCount] = useState(0);
  const [accountUser, setAccountUser] = useState<AuthUser | null>(null);
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountError, setAccountError] = useState('');
  const accountBusyRef = useRef(false);
  const accountRequestRef = useRef(0);
  const accountMountedRef = useRef(false);
  const servicesMenuRef = useRef<HTMLDivElement>(null);
  const servicesTriggerRef = useRef<HTMLButtonElement>(null);
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const cartOpeningRef = useRef(false);
  const site = resolveSiteContent(institutionalContent.site, siteConfig);

  const closeCart = useCallback(() => setCartOpen(false), []);
  const openCart = useCallback(async () => {
    if (cartOpeningRef.current) return;
    cartOpeningRef.current = true;
    setCartOpening(true);
    try {
      const publicId = await getOrCreateCart();
      setCartPublicId(publicId);
      setCartOpen(true);
    } catch {
      setCartOpen(false);
    } finally {
      cartOpeningRef.current = false;
      setCartOpening(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void loadSiteConfig().then((config) => {
      if (active) setSiteConfig(config);
    });
    return () => { active = false; };
  }, []);

  const refreshAccount = useCallback(async () => {
    const requestId = ++accountRequestRef.current;
    const user = await getCurrentUser();
    if (accountMountedRef.current && requestId === accountRequestRef.current) setAccountUser(user);
  }, []);

  useEffect(() => {
    accountMountedRef.current = true;
    void refreshAccount();
    const handleAuthUpdated = () => {
      setAccountError('');
      void refreshAccount();
    };
    window.addEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
    return () => {
      accountMountedRef.current = false;
      accountRequestRef.current += 1;
      window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
    };
  }, [refreshAccount]);

  useEffect(() => {
    if (siteConfig?.site.title) document.title = siteConfig.site.title;
    const faviconPath = siteConfig?.site.faviconPath;
    if (!faviconPath) return;
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconPath;
  }, [siteConfig?.site.faviconPath, siteConfig?.site.title]);

  useEffect(() => {
    setServicesMenuOpen(false);
    setCartOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const storedPublicId = window.localStorage.getItem('je_cart_public_id');
    if (!storedPublicId) return;
    let active = true;
    void getCart(storedPublicId)
      .then((cart) => {
        if (!active) return;
        if (cart.status && cart.status !== 'ACTIVE') {
          window.localStorage.removeItem('je_cart_public_id');
          setCartPublicId(null);
          setCartCount(0);
          return;
        }
        setCartCount(cart.items.reduce((total, item) => total + item.quantity, 0));
      })
      .catch(() => {
        if (active) {
          window.localStorage.removeItem('je_cart_public_id');
          setCartPublicId(null);
          setCartCount(0);
        }
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const refreshCartCount = () => {
      const storedPublicId = window.localStorage.getItem('je_cart_public_id');
      if (!storedPublicId) {
        setCartCount(0);
        setCartPublicId(null);
        return;
      }
      setCartPublicId(storedPublicId);
      void getCart(storedPublicId)
        .then((cart) => {
          if (cart.status && cart.status !== 'ACTIVE') {
            window.localStorage.removeItem('je_cart_public_id');
            setCartPublicId(null);
            setCartCount(0);
            return;
          }
          setCartCount(cart.items.reduce((total, item) => total + item.quantity, 0));
        })
        .catch(() => {
          window.localStorage.removeItem('je_cart_public_id');
          setCartPublicId(null);
          setCartCount(0);
        });
    };
    window.addEventListener(CART_UPDATED_EVENT, refreshCartCount);
    return () => window.removeEventListener(CART_UPDATED_EVENT, refreshCartCount);
  }, []);

  useEffect(() => {
    if (!servicesMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !servicesMenuRef.current?.contains(event.target)) {
        setServicesMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setServicesMenuOpen(false);
      servicesTriggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [servicesMenuOpen]);

  const handleLogout = useCallback(async () => {
    if (accountBusyRef.current) return;
    accountBusyRef.current = true;
    setAccountBusy(true);
    setAccountError('');
    try {
      await logout();
      if (!accountMountedRef.current) return;
      setAccountUser(null);
      navigate('/entrar');
    } catch (cause) {
      if (accountMountedRef.current) setAccountError(cause instanceof Error ? cause.message : 'Não foi possível sair da conta. Tente novamente.');
    } finally {
      accountBusyRef.current = false;
      if (accountMountedRef.current) setAccountBusy(false);
    }
  }, [navigate]);

  const renderAccountAction = (className: string) => accountUser ? (
    <span className="account-session-actions">
      <Link className={`${className} ${className}--link`} to="/conta">
        <Icon name="user" size={16} strokeWidth={1.8} />
        <span className={className === 'header-account' ? 'sr-only' : undefined}>Minha conta</span>
      </Link>
      <button
        className={`${className} ${className}--logout${className === 'header-account' ? ' sr-only' : ''}`}
        type="button"
        aria-label="Sair da conta"
        aria-busy={accountBusy}
        disabled={accountBusy}
        onClick={() => void handleLogout()}
      >
        <Icon name="log-out" size={16} strokeWidth={1.8} />
        <span className={className === 'header-account' ? 'sr-only' : undefined}>Sair</span>
      </button>
    </span>
  ) : (
    <Link className={className} to="/entrar">
      <Icon name="user" size={16} strokeWidth={1.8} />
      <span className={className === 'header-account' ? 'sr-only' : undefined}>Entrar</span>
    </Link>
  );

  const renderDesktopNavigation = (className = 'primary-nav') => (
    <nav className={className} aria-label="Navegação principal">
      {navigation.map((item) => (
        item.children ? (
          <div className="primary-nav__dropdown" key={item.href} ref={servicesMenuRef}>
            <button
              type="button"
              ref={servicesTriggerRef}
              className={isNavigationEntryActive(location.pathname, item) ? 'is-active' : undefined}
              aria-controls="services-menu"
              aria-expanded={servicesMenuOpen}
              aria-haspopup="true"
              onClick={() => setServicesMenuOpen((open) => !open)}
            >
              {item.label} <Icon name="chevron-down" size={14} strokeWidth={2} />
            </button>
            <div id="services-menu" className="primary-nav__dropdown-menu" data-state={servicesMenuOpen ? 'open' : 'closed'} aria-hidden={!servicesMenuOpen}>
              {item.children.map((child) => <Link key={child.href} to={child.href}>{child.label}</Link>)}
            </div>
          </div>
        ) : (
          <Link className={isNavigationEntryActive(location.pathname, item) ? 'is-active' : undefined} key={item.href} to={item.href}>
            {item.label}
          </Link>
        )
      ))}
    </nav>
  );
  const renderMobileNavigation = (className = 'mobile-navigation') => (
    <details className={className}>
      <summary aria-label="Abrir menu"><Icon name="menu" size={20} strokeWidth={2} />Menu</summary>
      <nav aria-label="Navegação móvel">
        {navigation.map((item) => item.children ? (
          <details key={item.href} className="mobile-navigation__services">
            <summary>{item.label}</summary>
            <div>{item.children.map((child) => <Link key={child.href} to={child.href}>{child.label}</Link>)}</div>
          </details>
        ) : <Link key={item.href} to={item.href}>{item.label}</Link>)}
        <button className="mobile-navigation__cart" type="button" aria-label="Abrir carrinho" aria-busy={cartOpening} disabled={cartOpening} onClick={() => void openCart()}><Icon name="shopping-cart" size={18} strokeWidth={1.8} /><span>Carrinho</span>{cartCount ? <span className="cart-badge" aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span> : null}</button>
        {renderAccountAction('mobile-navigation__account')}
      </nav>
    </details>
  );

  return (
    <SiteConfigContext.Provider value={siteConfig}>
    <div className="site-shell">
      <header className="site-header" role="banner">
        <div className="utility-bar">
          <div className="site-container utility-bar__inner">
            <a className="utility-bar__address" href={site.mapsUrl} target="_blank" rel="noreferrer">
              <span aria-hidden="true"><Icon name="map-pin" size={13} strokeWidth={2} /></span>
              <span>{site.address} ({site.addressNote})</span>
            </a>
            <div className="utility-bar__links">
              <a href={site.whatsapp} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${site.phone}`}>
                <span aria-hidden="true"><WhatsAppBrandIcon size={13} /></span>
                <span>{site.phone}</span>
              </a>
              <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Icon name="instagram" size={13} strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>

        <div className="navigation-bar">
          <div className="site-container navigation-bar__inner">
            <Link className="brand-lockup" to="/" aria-label="Jonas & Elivaldo Hair Designers">
              <img src={site.logoPath} alt="Jonas & Elivaldo Hair Designers" onError={(event) => { if (event.currentTarget.getAttribute('src') !== '/brand-logo.jpg') event.currentTarget.src = '/brand-logo.jpg'; }} />
            </Link>

            {renderDesktopNavigation()}

            <div className="header-actions">
              {renderAccountAction('header-account')}
              {accountError ? <span className="header-account__error" role="alert">{accountError}</span> : null}
              <button ref={cartTriggerRef} className="header-action header-action--cart" type="button" aria-label="Carrinho" aria-controls="storefront-cart-drawer" aria-expanded={cartOpen} aria-busy={cartOpening} disabled={cartOpening} onClick={() => void openCart()}>
                <Icon name="shopping-cart" size={19} strokeWidth={1.8} />
                <span className="sr-only">Carrinho</span>
                {cartCount ? <span className="cart-badge" aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span> : null}
              </button>
              <a className="button button--whatsapp" href={site.whatsapp} target="_blank" rel="noreferrer"><span className="whatsapp-button__icon" aria-hidden="true"><WhatsAppBrandIcon size={18} /></span><span>WhatsApp</span></a>
            </div>

            {renderMobileNavigation()}
          </div>
        </div>
      </header>

      <div className="site-main">{children}</div>

      {cartOpen && cartPublicId ? <CartDrawer publicId={cartPublicId} mode="drawer" onClose={closeCart} /> : null}

      <footer className="site-footer" role="contentinfo">
        <div className="site-container site-footer__grid">
          <div className="site-footer__brand">
            <img className="site-footer__logo" src={site.logoPath} alt="Jonas & Elivaldo Hair Designers" onError={(event) => { if (event.currentTarget.getAttribute('src') !== '/brand-logo.jpg') event.currentTarget.src = '/brand-logo.jpg'; }} />
          </div>
          <div>
            <h2>Endereço</h2>
            <a className="site-footer__address" href={site.mapsUrl} target="_blank" rel="noreferrer" aria-label={`Endereço: ${site.address}`}>
              <Icon name="map-pin" size={18} strokeWidth={1.8} />
              <span>{site.address}<br />({site.addressNote})</span>
            </a>
          </div>
          <div>
            <h2>Contatos</h2>
            <a className="site-footer__phone" href={site.whatsapp} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${site.phone}`}><Icon name="message-circle" size={22} strokeWidth={1.8} />{site.phone}</a>
            <p className="site-footer__follow">Siga nos</p>
            <a className="site-footer__instagram" href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" size={20} strokeWidth={1.8} /></a>
          </div>
        </div>
        <div className="site-footer__bottom">
          <div className="site-container site-footer__bottom-inner">
            <span className="site-footer__copyright">Copyright © {currentYear} Jonas & Elivaldo Hair Designers. Todos os direitos reservados.</span>
            <SiteLanguageSwitcher />
            <span className="site-footer__developer">Desenvolvido por: <a href={site.developerUrl} target="_blank" rel="noreferrer" aria-label="Desenvolvido por iDedigital">iDedigital</a></span>
          </div>
        </div>
      </footer>
    </div>
    </SiteConfigContext.Provider>
  );
}
