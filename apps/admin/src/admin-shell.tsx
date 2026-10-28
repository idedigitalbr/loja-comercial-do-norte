import { useEffect, useState } from 'react';
import { Icon, type IconName } from '@commerce/ui';
import { ProductListPage } from './features/catalog/product-list-page';
import { ProductEditorPage } from './features/catalog/product-editor-page';
import { BrandEditorPage } from './features/catalog/brand-editor-page';
import { CategoriesPage } from './features/catalog/categories-page';
import { TagsPage } from './features/catalog/tags-page';
import { InventoryPage } from './features/inventory/inventory-page';
import { OrdersListPage } from './features/orders/orders-list-page';
import { QuotesPage } from './features/quotes/quotes-page';
import { ReportsPage } from './features/reports/reports-page';
import { CustomersPage } from './features/customers/customers-page';
import { PromotionsPage } from './features/promotions/promotions-page';
import { SettingsPage } from './features/settings/settings-page';
import { HomeBannersPage } from './features/settings/home-banners-page';
import { PostListPage } from './features/content/post-list-page';
import { PostEditorPage } from './features/content/post-editor-page';
import { PostCategoriesPage } from './features/content/post-categories-page';
import { EventListPage } from './features/content/event-list-page';
import { EventEditorPage } from './features/content/event-editor-page';

export type AdminSection =
  | 'overview'
  | 'home-banners'
  | 'catalog'
  | 'posts'
  | 'events'
  | 'quotes'
  | 'orders'
  | 'inventory'
  | 'customers'
  | 'promotions'
  | 'reports'
  | 'settings';

export type CatalogSubPage = 'products' | 'categories' | 'tags';

type NavigationItem = { id: AdminSection; label: string; description: string; icon: IconName };
type DashboardProduct = { id: string };
type DashboardOrder = { id: string; status: string; totalCents: number; publicId: string };

const navigation: NavigationItem[] = [
  { id: 'overview', label: 'Visão geral', description: 'Resumo da operação', icon: 'layout-dashboard' },
  { id: 'home-banners', label: 'Editar Páginas e Banners', description: 'Editor visual da vitrine e seções', icon: 'image' },
  { id: 'catalog', label: 'Produtos', description: 'Produtos e marcas', icon: 'shopping-bag' },
  { id: 'posts', label: 'Posts', description: 'Artigos e dicas Explica Aí Nort', icon: 'file-text' },
  { id: 'events', label: 'Eventos', description: 'Workshops e acontecimentos', icon: 'calendar' },
  { id: 'quotes', label: 'Cotações', description: 'Solicitações da loja', icon: 'clipboard-list' },
  { id: 'orders', label: 'Pedidos', description: 'Venda e atendimento', icon: 'clipboard-list' },
  { id: 'inventory', label: 'Estoque', description: 'Saldos e ajustes', icon: 'warehouse' },
  { id: 'customers', label: 'Clientes', description: 'Base e relacionamento', icon: 'users' },
  { id: 'promotions', label: 'Promoções', description: 'Cupons e campanhas', icon: 'ticket-percent' },
  { id: 'reports', label: 'Relatórios', description: 'Indicadores comerciais', icon: 'bar-chart-3' },
  { id: 'settings', label: 'Configurações', description: 'Site e integrações', icon: 'sliders-horizontal' },
];

const adminSectionRoutes: Record<AdminSection, string> = {
  overview: '/admin/',
  'home-banners': '/admin/banners-home',
  catalog: '/admin/catalogo/produtos',
  posts: '/admin/posts',
  events: '/admin/eventos',
  quotes: '/admin/cotacoes',
  orders: '/admin/orders',
  inventory: '/admin/inventory',
  customers: '/admin/customers',
  promotions: '/admin/promotions',
  reports: '/admin/reports',
  settings: '/admin/settings',
};

export function getAdminView(userEmail: string | null): 'login' | 'dashboard' {
  return userEmail ? 'dashboard' : 'login';
}

export function getAdminNavigation(): NavigationItem[] {
  return navigation;
}

function appendStorefrontPath(value: string): string {
  const cleanValue = value.replace(/\/+$/, '');
  return cleanValue.endsWith('/loja') ? cleanValue : `${cleanValue}/loja`;
}

export function getStorefrontUrl(origin = window.location.origin): string {
  const configuredUrl = (import.meta.env.VITE_STOREFRONT_URL as string | undefined)?.trim();
  if (configuredUrl) return appendStorefrontPath(configuredUrl);

  const storefrontOrigin = origin.includes(':5174') ? origin.replace(':5174', ':3001') : origin;
  return appendStorefrontPath(storefrontOrigin);
}

export function getStorefrontEditorUrl(origin = window.location.origin): string {
  const configuredUrl = (import.meta.env.VITE_STOREFRONT_URL as string | undefined)?.trim();
  const base = configuredUrl
    ? configuredUrl.replace(/\/+$/, '').replace(/\/loja\/?$/, '')
    : origin.includes(':5174')
      ? origin.replace(':5174', ':3001')
      : 'http://localhost:3001';
  return `${base.replace(/\/+$/, '')}/?editor=1`;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function OverviewPage() {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch('/api/v1/admin/catalog/products', { credentials: 'include' }).then(async (response) =>
        response.ok ? (response.json() as Promise<DashboardProduct[]>) : []
      ),
      fetch('/api/v1/admin/orders', { credentials: 'include' }).then(async (response) =>
        response.ok ? (response.json() as Promise<DashboardOrder[]>) : []
      ),
    ])
      .then(([productList, orderList]) => {
        if (!active) return;
        setProducts(productList);
        setOrders(orderList);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const awaitingPayment = orders.filter((order) => order.status === 'AWAITING_PAYMENT').length;
  const grossCents = orders.reduce((total, order) => total + order.totalCents, 0);

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Operação em tempo real</p>
          <h2>Visão geral</h2>
        </div>
        <p>Acompanhe o catálogo, as vendas e o estoque da Comercial do Norte.</p>
      </div>
      <div className="admin-kpi-grid">
        <article className="admin-kpi">
          <span>Produtos ativos</span>
          <strong>{products.length}</strong>
          <small>Catálogo disponível</small>
        </article>
        <article className="admin-kpi">
          <span>Pedidos</span>
          <strong>{orders.length}</strong>
          <small>Últimos pedidos registrados</small>
        </article>
        <article className="admin-kpi">
          <span>Aguardando pagamento</span>
          <strong>{awaitingPayment}</strong>
          <small>Exige acompanhamento</small>
        </article>
        <article className="admin-kpi">
          <span>Volume bruto</span>
          <strong>{formatCurrency(grossCents)}</strong>
          <small>Pedidos carregados</small>
        </article>
      </div>
      <div className="admin-dashboard-grid">
        <article className="admin-card">
          <p className="admin-eyebrow">Atalhos</p>
          <h3>Próximas ações</h3>
          <p>Gerencie produtos, atualize saldos e acompanhe solicitações de cotação em um único fluxo.</p>
          <div className="admin-card__actions">
            <span>Catálogo institucional e vitrine modular ativos</span>
            <span>Fila de cotações integrada ao atendimento comercial</span>
            <span>Banners e identidade visual gerenciáveis no painel</span>
          </div>
        </article>
        <article className="admin-card">
          <p className="admin-eyebrow">Últimos pedidos</p>
          <h3>Movimentações recentes</h3>
          {orders.length ? (
            <ul className="admin-list">
              {orders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <span>{order.publicId}</span>
                  <strong>{formatCurrency(order.totalCents)}</strong>
                  <small>{order.status}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-empty">Nenhum pedido carregado.</p>
          )}
        </article>
      </div>
    </section>
  );
}


type PostRoute = { mode: 'new' | 'edit'; id?: string } | null;
type EventRoute = { mode: 'new' | 'edit'; id?: string } | null;
type PostsSubPage = 'posts' | 'categories';

function readPostRoute(pathname = window.location.pathname): PostRoute {
  if (/^\/admin\/posts\/novo\/?$/.test(pathname)) return { mode: 'new' };
  const match = pathname.match(/^\/admin\/posts\/([^/]+)\/editar\/?$/);
  return match ? { mode: 'edit', id: decodeURIComponent(match[1]) } : null;
}

function readEventRoute(pathname = window.location.pathname): EventRoute {
  if (/^\/admin\/eventos\/novo\/?$/.test(pathname)) return { mode: 'new' };
  const match = pathname.match(/^\/admin\/eventos\/([^/]+)\/editar\/?$/);
  return match ? { mode: 'edit', id: decodeURIComponent(match[1]) } : null;
}

function readPostSubPage(pathname = window.location.pathname): PostsSubPage {
  if (/^\/admin\/posts\/categorias\/?$/.test(pathname)) return 'categories';
  return 'posts';
}

type ProductRoute = { mode: 'new' | 'edit'; id?: string } | null;
type BrandRoute = { mode: 'new' | 'edit'; id?: string; parentId?: string } | null;

function readProductRoute(pathname = window.location.pathname): ProductRoute {
  const newProductMatch = pathname.match(/^\/admin\/catalogo\/produtos\/novo\/?$/);
  if (newProductMatch) return { mode: 'new' };
  const editProductMatch = pathname.match(/^\/admin\/catalogo\/produtos\/([^/]+)\/editar\/?$/);
  return editProductMatch ? { mode: 'edit', id: decodeURIComponent(editProductMatch[1]) } : null;
}

function readBrandRoute(pathname = window.location.pathname, search = window.location.search): BrandRoute {
  if (/^\/admin\/catalogo\/marcas\/nova\/?$/.test(pathname))
    return { mode: 'new', parentId: new URLSearchParams(search).get('parentId') ?? undefined };
  const editBrandMatch = pathname.match(/^\/admin\/catalogo\/marcas\/([^/]+)\/editar\/?$/);
  return editBrandMatch ? { mode: 'edit', id: decodeURIComponent(editBrandMatch[1]) } : null;
}

export function readCatalogSubPage(pathname = window.location.pathname): CatalogSubPage {
  if (/^\/admin\/catalogo\/categorias\/?$/.test(pathname)) return 'categories';
  if (/^\/admin\/catalogo\/(tags|marcas)\/?$/.test(pathname)) return 'tags';
  return 'products';
}

function isHomeBannersRoute(pathname = window.location.pathname): boolean {
  return /^\/admin\/banners-home\/?$/.test(pathname);
}

function isPromotionsRoute(pathname = window.location.pathname): boolean {
  return /^\/admin\/promotions\/?$/.test(pathname);
}

export function getInitialAdminSection(pathname = window.location.pathname): AdminSection {
  if (isHomeBannersRoute(pathname)) return 'home-banners';
  if (isPromotionsRoute(pathname)) return 'promotions';
  if (readProductRoute(pathname) || readBrandRoute(pathname) || /^\/admin\/catalogo(\/.*)?$/.test(pathname))
    return 'catalog';
  if (readPostRoute(pathname) || /^\/admin\/posts(\/.*)?$/.test(pathname))
    return 'posts';
  if (readEventRoute(pathname) || /^\/admin\/eventos(\/.*)?$/.test(pathname))
    return 'events';
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const section = Object.entries(adminSectionRoutes).find(([, route]) => {
    const normalizedRoute = route.length > 1 ? route.replace(/\/+$/, '') : route;
    return normalizedPath === normalizedRoute;
  })?.[0] as AdminSection | undefined;
  return section ?? 'overview';
}

function SectionContent({
  section,
  onCreateProduct,
  onEditProduct,
  onCreateBrand,
  onEditBrand,
}: {
  section: AdminSection;
  onCreateProduct: () => void;
  onEditProduct: (id: string) => void;
  onCreateBrand: () => void;
  onEditBrand: (id: string) => void;
}) {
  if (section === 'home-banners') return <HomeBannersPage />;
  if (section === 'catalog')
    return (
      <ProductListPage
        onCreate={onCreateProduct}
        onEdit={onEditProduct}
        onCreateBrand={onCreateBrand}
        onEditBrand={onEditBrand}
      />
    );
  if (section === 'quotes') return <QuotesPage />;
  if (section === 'orders') return <OrdersListPage />;
  if (section === 'inventory') return <InventoryPage />;
  if (section === 'customers') return <CustomersPage />;
  if (section === 'promotions') return <PromotionsPage />;
  if (section === 'reports') return <ReportsPage />;
  if (section === 'settings') return <SettingsPage />;
  return <OverviewPage />;
}

export function AdminDashboard({ userEmail, onLogout }: { userEmail: string; onLogout: () => void }) {
  const [homeBannersRoute, setHomeBannersRoute] = useState(() => isHomeBannersRoute());
  const [section, setSection] = useState<AdminSection>(() => getInitialAdminSection());
  const [catalogSubPage, setCatalogSubPage] = useState<CatalogSubPage>(() => readCatalogSubPage());
  const [productRoute, setProductRoute] = useState<ProductRoute>(() => readProductRoute());
  const [brandRoute, setBrandRoute] = useState<BrandRoute>(() => readBrandRoute());
  const [postRoute, setPostRoute] = useState<PostRoute>(() => readPostRoute());
  const [eventRoute, setEventRoute] = useState<EventRoute>(() => readEventRoute());
  const [postSubPage, setPostSubPage] = useState<PostsSubPage>(() => readPostSubPage());

  useEffect(() => {
    const handlePopState = () => {
      const nextHomeBannersRoute = isHomeBannersRoute();
      const nextProductRoute = readProductRoute();
      const nextBrandRoute = readBrandRoute();
      const nextCatalogSubPage = readCatalogSubPage();
      const nextPostRoute = readPostRoute();
      const nextEventRoute = readEventRoute();
      const nextPostSubPage = readPostSubPage();
      setHomeBannersRoute(nextHomeBannersRoute);
      setProductRoute(nextProductRoute);
      setBrandRoute(nextBrandRoute);
      setCatalogSubPage(nextCatalogSubPage);
      setPostRoute(nextPostRoute);
      setEventRoute(nextEventRoute);
      setPostSubPage(nextPostSubPage);
      setSection(
        nextHomeBannersRoute
          ? 'home-banners'
          : nextProductRoute || nextBrandRoute || /^\/admin\/catalogo(\/.*)?$/.test(window.location.pathname)
            ? 'catalog'
            : nextPostRoute || /^\/admin\/posts(\/.*)?$/.test(window.location.pathname)
              ? 'posts'
              : nextEventRoute || /^\/admin\/eventos(\/.*)?$/.test(window.location.pathname)
                ? 'events'
                : getInitialAdminSection()
      );
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(pathname: string) {
    const target = new URL(pathname, window.location.origin);
    window.history.pushState({}, '', `${target.pathname}${target.search}`);
    const nextHomeBannersRoute = isHomeBannersRoute(target.pathname);
    const nextProductRoute = readProductRoute(target.pathname);
    const nextBrandRoute = readBrandRoute(target.pathname, target.search);
    const nextCatalogSubPage = readCatalogSubPage(target.pathname);
    const nextPostRoute = readPostRoute(target.pathname);
    const nextEventRoute = readEventRoute(target.pathname);
    const nextPostSubPage = readPostSubPage(target.pathname);
    setHomeBannersRoute(nextHomeBannersRoute);
    setProductRoute(nextProductRoute);
    setBrandRoute(nextBrandRoute);
    setCatalogSubPage(nextCatalogSubPage);
    setPostRoute(nextPostRoute);
    setEventRoute(nextEventRoute);
    setPostSubPage(nextPostSubPage);
    setSection(
      nextHomeBannersRoute
        ? 'home-banners'
        : nextProductRoute || nextBrandRoute || /^\/admin\/catalogo(\/.*)?$/.test(target.pathname)
          ? 'catalog'
          : nextPostRoute || /^\/admin\/posts(\/.*)?$/.test(target.pathname)
            ? 'posts'
            : nextEventRoute || /^\/admin\/eventos(\/.*)?$/.test(target.pathname)
              ? 'events'
              : getInitialAdminSection(target.pathname)
    );
  }

  async function logout() {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    onLogout();
  }

  return (
    <div className="admin-app-shell">
      {/* WordPress-style Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-eyebrow">Comercial do Norte</span>
          <strong>Gestão profissional</strong>
        </div>

        <nav className="admin-nav" aria-label="Navegação administrativa">
          {navigation.map((item) => {
            const isItemActive = section === item.id;

            return (
              <div key={item.id} className="admin-nav__group">
                <button
                  className={`admin-nav__item ${isItemActive ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => {
                    navigate(adminSectionRoutes[item.id]);
                  }}
                >
                  <span className="admin-nav__label">
                    <Icon name={item.icon} size={18} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </span>
                </button>


                {/* Submenu de Posts (WordPress style) */}
                {item.id === 'posts' && isItemActive && (
                  <div className="admin-subnav" role="menu" aria-label="Submenu de Posts">
                    <button
                      className={`admin-subnav__item ${
                        postSubPage === 'posts' && !postRoute ? 'is-active' : ''
                      }`}
                      type="button"
                      onClick={() => navigate('/admin/posts')}
                    >
                      Todos
                    </button>
                    <button
                      className={`admin-subnav__item ${postRoute?.mode === 'new' ? 'is-active' : ''}`}
                      type="button"
                      onClick={() => navigate('/admin/posts/novo')}
                    >
                      Adicionar Novo
                    </button>
                    <button
                      className={`admin-subnav__item ${
                        postSubPage === 'categories' && !postRoute ? 'is-active' : ''
                      }`}
                      type="button"
                      onClick={() => navigate('/admin/posts/categorias')}
                    >
                      Categorias
                    </button>
                  </div>
                )}

                {/* Submenu de Eventos (WordPress style) */}
                {item.id === 'events' && isItemActive && (
                  <div className="admin-subnav" role="menu" aria-label="Submenu de Eventos">
                    <button
                      className={`admin-subnav__item ${!eventRoute ? 'is-active' : ''}`}
                      type="button"
                      onClick={() => navigate('/admin/eventos')}
                    >
                      Todos
                    </button>
                    <button
                      className={`admin-subnav__item ${eventRoute?.mode === 'new' ? 'is-active' : ''}`}
                      type="button"
                      onClick={() => navigate('/admin/eventos/novo')}
                    >
                      Adicionar Novo
                    </button>
                  </div>
                )}
                {/* Submenu de Produtos (Anexo 2 do WordPress) */}
                {item.id === 'catalog' && isItemActive && (
                  <div className="admin-subnav" role="menu" aria-label="Submenu de Produtos">
                    <button
                      className={`admin-subnav__item ${
                        catalogSubPage === 'products' && !productRoute && !brandRoute ? 'is-active' : ''
                      }`}
                      type="button"
                      onClick={() => navigate('/admin/catalogo/produtos')}
                    >
                      Todos
                    </button>
                    <button
                      className={`admin-subnav__item ${productRoute?.mode === 'new' ? 'is-active' : ''}`}
                      type="button"
                      onClick={() => navigate('/admin/catalogo/produtos/novo')}
                    >
                      Adicionar Novo
                    </button>
                    <button
                      className={`admin-subnav__item ${
                        catalogSubPage === 'categories' && !productRoute && !brandRoute ? 'is-active' : ''
                      }`}
                      type="button"
                      onClick={() => navigate('/admin/catalogo/categorias')}
                    >
                      Categorias
                    </button>
                    <button
                      className={`admin-subnav__item ${
                        catalogSubPage === 'tags' && !productRoute && !brandRoute ? 'is-active' : ''
                      }`}
                      type="button"
                      onClick={() => navigate('/admin/catalogo/tags')}
                    >
                      Tags
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <button className="admin-sidebar__logout" type="button" onClick={() => void logout()}>
          Sair da conta
        </button>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-app-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar__context">Painel administrativo</span>
            <strong>Comercial do Norte</strong>
          </div>
          <div className="admin-topbar__actions">
            <a
              className="admin-topbar__storefront-link"
              href={getStorefrontUrl()}
              target="_blank"
              rel="noreferrer"
            >
              Ver loja <Icon name="arrow-up-right" size={15} strokeWidth={2} />
            </a>
            <div className="admin-user">
              <span>{userEmail}</span>
              <span className="admin-user__status">Admin</span>
            </div>
          </div>
        </header>

        {brandRoute ? (
          <BrandEditorPage
            brandId={brandRoute.mode === 'edit' ? brandRoute.id : undefined}
            initialParentId={brandRoute.parentId}
            onBack={() => navigate('/admin/catalogo/tags')}
            onOpenBrand={(id) => navigate(`/admin/catalogo/marcas/${encodeURIComponent(id)}/editar`)}
            onCreateChild={(parentId) => navigate(`/admin/catalogo/marcas/nova?parentId=${encodeURIComponent(parentId)}`)}
          />
        ) : productRoute ? (
          <ProductEditorPage
            productId={productRoute.mode === 'edit' ? productRoute.id : undefined}
            onBack={() => navigate('/admin/catalogo/produtos')}
            onOpenProduct={(id) => navigate(`/admin/catalogo/produtos/${encodeURIComponent(id)}/editar`)}
          />
        ) : postRoute ? (
          <PostEditorPage
            postId={postRoute.mode === 'edit' ? postRoute.id : undefined}
            onBack={() => navigate('/admin/posts')}
            onSaved={() => navigate('/admin/posts')}
          />
        ) : eventRoute ? (
          <EventEditorPage
            eventId={eventRoute.mode === 'edit' ? eventRoute.id : undefined}
            onBack={() => navigate('/admin/eventos')}
            onSaved={() => navigate('/admin/eventos')}
          />
        ) : section === 'posts' ? (
          postSubPage === 'categories' ? (
            <PostCategoriesPage onBack={() => navigate('/admin/posts')} />
          ) : (
            <PostListPage
              onCreate={() => navigate('/admin/posts/novo')}
              onEdit={(id) => navigate(`/admin/posts/${encodeURIComponent(id)}/editar`)}
              onManageCategories={() => navigate('/admin/posts/categorias')}
              onNavigate={(path) => navigate(path)}
            />
          )
        ) : section === 'events' ? (
          <EventListPage
            onCreate={() => navigate('/admin/eventos/novo')}
            onEdit={(id) => navigate(`/admin/eventos/${encodeURIComponent(id)}/editar`)}
          />
        ) : homeBannersRoute ? (
          <HomeBannersPage />
        ) : section === 'catalog' ? (
          catalogSubPage === 'categories' ? (
            <CategoriesPage onNavigate={(path) => navigate(path)} />
          ) : catalogSubPage === 'tags' ? (
            <TagsPage
              onNavigate={(path) => navigate(path)}
              onOpenBrand={(id) => navigate(`/admin/catalogo/marcas/${encodeURIComponent(id)}/editar`)}
            />
          ) : (
            <ProductListPage
              onCreate={() => navigate('/admin/catalogo/produtos/novo')}
              onEdit={(id) => navigate(`/admin/catalogo/produtos/${encodeURIComponent(id)}/editar`)}
              onCreateBrand={() => navigate('/admin/catalogo/marcas/nova')}
              onEditBrand={(id) => navigate(`/admin/catalogo/marcas/${encodeURIComponent(id)}/editar`)}
              onNavigate={(path) => navigate(path)}
            />
          )
        ) : (
          <SectionContent
            section={section}
            onCreateProduct={() => navigate('/admin/catalogo/produtos/novo')}
            onEditProduct={(id) => navigate(`/admin/catalogo/produtos/${encodeURIComponent(id)}/editar`)}
            onCreateBrand={() => navigate('/admin/catalogo/marcas/nova')}
            onEditBrand={(id) => navigate(`/admin/catalogo/marcas/${encodeURIComponent(id)}/editar`)}
          />
        )}
      </div>
    </div>
  );
}
