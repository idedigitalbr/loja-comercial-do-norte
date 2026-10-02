import { describe, expect, it } from 'vitest';
import { getAdminView, getAdminNavigation, getInitialAdminSection, getStorefrontUrl } from './admin-shell';

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
      'warehouse',
      'users',
      'ticket-percent',
      'bar-chart-3',
      'sliders-horizontal',
    ]);
  });

  it('builds the local storefront link from the admin origin', () => {
    expect(getStorefrontUrl('http://localhost:5174')).toBe('http://localhost:5173/loja');
  });

  it('opens deep-linked operational pages directly', () => {
    expect(getInitialAdminSection('/admin/')).toBe('overview');
    expect(getInitialAdminSection('/admin/promotions')).toBe('promotions');
    expect(getInitialAdminSection('/admin/banners-home/')).toBe('home-banners');
    expect(getInitialAdminSection('/admin/orders')).toBe('orders');
    expect(getInitialAdminSection('/admin/catalogo/produtos')).toBe('catalog');
  });
});
