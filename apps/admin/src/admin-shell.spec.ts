import { describe, expect, it } from 'vitest';
import {
  getAdminView,
  getAdminNavigation,
  getInitialAdminSection,
  getStorefrontUrl,
  readCatalogSubPage,
} from './admin-shell';

describe('admin shell', () => {
  it('opens the dashboard when an authenticated user is available', () => {
    expect(getAdminView('admin@admin.com')).toBe('dashboard');
    expect(getAdminView(null)).toBe('login');
  });

  it('exposes the core operational sections', () => {
    expect(getAdminNavigation().map((item) => item.id)).toEqual([
      'overview',
      'home-banners',
      'catalog',
      'posts',
      'events',
      'crm',
      'orders',
      'inventory',
      'customers',
      'promotions',
      'reports',
      'settings',
    ]);
    expect(getAdminNavigation().map((item) => item.icon)).toEqual([
      'layout-dashboard',
      'image',
      'shopping-bag',
      'file-text',
      'calendar',
      'message-circle',
      'clipboard-list',
      'warehouse',
      'users',
      'ticket-percent',
      'bar-chart-3',
      'sliders-horizontal',
    ]);
    // The label is changed to "Produtos" as requested
    expect(getAdminNavigation().find((item) => item.id === 'catalog')?.label).toBe('Produtos');
    expect(getAdminNavigation().find((item) => item.id === 'posts')?.label).toBe('Posts');
    expect(getAdminNavigation().find((item) => item.id === 'events')?.label).toBe('Eventos');
    expect(getAdminNavigation().find((item) => item.id === 'crm')?.label).toBe('CRM (Leads & Cotações)');
  });

  it('aponta para o storefront Next.js (porta 3001) a partir do admin', () => {
    expect(getStorefrontUrl('http://localhost:5174')).toBe('http://localhost:3001/loja');
  });

  it('opens deep-linked operational pages directly', () => {
    expect(getInitialAdminSection('/admin/')).toBe('overview');
    expect(getInitialAdminSection('/admin/promotions')).toBe('promotions');
    expect(getInitialAdminSection('/admin/banners-home/')).toBe('home-banners');
    expect(getInitialAdminSection('/admin/cotacoes')).toBe('crm');
    expect(getInitialAdminSection('/admin/cotacoes/pub-123')).toBe('crm');
    expect(getInitialAdminSection('/admin/crm')).toBe('crm');
    expect(getInitialAdminSection('/admin/orders')).toBe('orders');
    expect(getInitialAdminSection('/admin/catalogo/produtos')).toBe('catalog');
    expect(getInitialAdminSection('/admin/catalogo/categorias')).toBe('catalog');
    expect(getInitialAdminSection('/admin/catalogo/tags')).toBe('catalog');
    expect(getInitialAdminSection('/admin/posts')).toBe('posts');
    expect(getInitialAdminSection('/admin/eventos')).toBe('events');
  });

  it('identifies the active WordPress-style catalog subpage', () => {
    expect(readCatalogSubPage('/admin/catalogo/produtos')).toBe('products');
    expect(readCatalogSubPage('/admin/catalogo/categorias')).toBe('categories');
    expect(readCatalogSubPage('/admin/catalogo/tags')).toBe('tags');
    expect(readCatalogSubPage('/admin/catalogo/marcas')).toBe('brands');
  });
});
