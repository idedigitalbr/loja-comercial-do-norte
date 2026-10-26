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
      'quotes',
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
      'clipboard-list',
      'clipboard-list',
      'warehouse',
      'users',
      'ticket-percent',
      'bar-chart-3',
      'sliders-horizontal',
    ]);
    // The label is changed to "Produtos" as requested
    expect(getAdminNavigation().find((item) => item.id === 'catalog')?.label).toBe('Produtos');
  });

  it('aponta para o storefront Next.js (porta 3001) a partir do admin', () => {
    expect(getStorefrontUrl('http://localhost:5174')).toBe('http://localhost:3001/loja');
  });

  it('opens deep-linked operational pages directly', () => {
    expect(getInitialAdminSection('/admin/')).toBe('overview');
    expect(getInitialAdminSection('/admin/promotions')).toBe('promotions');
    expect(getInitialAdminSection('/admin/banners-home/')).toBe('home-banners');
    expect(getInitialAdminSection('/admin/cotacoes')).toBe('quotes');
    expect(getInitialAdminSection('/admin/orders')).toBe('orders');
    expect(getInitialAdminSection('/admin/catalogo/produtos')).toBe('catalog');
    expect(getInitialAdminSection('/admin/catalogo/categorias')).toBe('catalog');
    expect(getInitialAdminSection('/admin/catalogo/tags')).toBe('catalog');
  });

  it('identifies the active WordPress-style catalog subpage', () => {
    expect(readCatalogSubPage('/admin/catalogo/produtos')).toBe('products');
    expect(readCatalogSubPage('/admin/catalogo/categorias')).toBe('categories');
    expect(readCatalogSubPage('/admin/catalogo/tags')).toBe('tags');
    expect(readCatalogSubPage('/admin/catalogo/marcas')).toBe('tags');
  });
});
