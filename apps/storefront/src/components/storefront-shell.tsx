import { ReactNode, useEffect, useState } from 'react';
import { Icon } from '@commerce/ui';
import { Link, useLocation } from 'react-router-dom';
import { institutionalContent } from '../content/institutional-content';
import { loadSiteConfig, resolveSiteContent, SiteConfigContext, type PublicSiteConfig } from '../content/site-config-client';
import { SiteLanguageSwitcher } from './site-language-switcher';

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
  const currentYear = new Date().getFullYear();
  const [siteConfig, setSiteConfig] = useState<PublicSiteConfig | null>(null);
  const site = resolveSiteContent(institutionalContent.site, siteConfig);

  useEffect(() => {
    let active = true;
    void loadSiteConfig().then((config) => {
      if (active) setSiteConfig(config);
    });
    return () => { active = false; };
  }, []);

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

  return (
    <SiteConfigContext.Provider value={siteConfig}>
    <div className="site-shell">
      <header className="site-header" role="banner">
        <div className="utility-bar">
          <div className="site-container utility-bar__inner">
          <span>{site.address}</span>
          <div className="utility-bar__links">
              <a href={site.phoneHref}>{site.phone}</a>
              <a href={site.instagram} target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
        </div>

        <div className="navigation-bar">
          <div className="site-container navigation-bar__inner">
            <Link className="brand-lockup" to="/" aria-label="Jonas & Elivaldo Hair Designers">
              <img src={site.logoPath} alt="Jonas & Elivaldo Hair Designers" />
            </Link>

            <nav className="primary-nav" aria-label="Navegação principal">
              {navigation.map((item) => (
                item.children ? (
                  <div className="primary-nav__dropdown" key={item.href}>
                    <Link className={isNavigationEntryActive(location.pathname, item) ? 'is-active' : undefined} to={item.href}>
                      {item.label} <Icon name="chevron-down" size={14} strokeWidth={2} />
                    </Link>
                    <div className="primary-nav__dropdown-menu">
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

            <div className="header-actions">
              <Link className="header-action header-action--cart" to="/carrinho" aria-label="Carrinho">
                <Icon name="shopping-cart" size={19} strokeWidth={1.8} />
                <span>Carrinho</span>
              </Link>
              <Link className="header-action header-action--account" to="/entrar">Entrar</Link>
              <a className="button button--whatsapp" href={site.whatsapp} target="_blank" rel="noreferrer"><Icon name="message-circle" size={16} strokeWidth={2} />WhatsApp</a>
            </div>

            <details className="mobile-navigation">
              <summary aria-label="Abrir menu"><Icon name="menu" size={20} strokeWidth={2} />Menu</summary>
              <nav aria-label="Navegação móvel">
                {navigation.map((item) => item.children ? (
                  <details key={item.href} className="mobile-navigation__services">
                    <summary>{item.label}</summary>
                    <div>{item.children.map((child) => <Link key={child.href} to={child.href}>{child.label}</Link>)}</div>
                  </details>
                ) : <Link key={item.href} to={item.href}>{item.label}</Link>)}
                <Link to="/carrinho">Carrinho</Link>
                <Link to="/entrar">Entrar</Link>
              </nav>
            </details>
          </div>
        </div>
      </header>

      <div className="site-main">{children}</div>

      <footer className="site-footer" role="contentinfo">
        <div className="site-container site-footer__grid">
          <div className="site-footer__brand">
            <img className="site-footer__logo" src={site.logoPath} alt="Jonas & Elivaldo Hair Designers" />
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
