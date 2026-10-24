import type { ApiBrand, ApiCategory, ApiProduct, PublicQuote, SiteConfig } from './types';

/**
 * URL da API NestJS (fonte única de regra de negócio). O storefront só consome
 * REST: nunca acessa banco nem duplica regra comercial.
 */
export const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';

/** Converte o caminho salvo no banco (`uploads/...`) na URL pública da API. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${API_URL}/storage/${path.replace(/^\/+/, '')}`;
}

async function getJson<T>(path: string, revalidate = 60): Promise<T> {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    headers: { accept: 'application/json' },
    next: { revalidate },
  });
  if (!response.ok) throw new Error(`API ${response.status} em ${path}`);
  return response.json() as Promise<T>;
}

/** Variante tolerante a falha: a página renderiza um estado vazio/aviso. */
async function safeJson<T>(path: string, fallback: T, revalidate = 60): Promise<T> {
  try {
    return await getJson<T>(path, revalidate);
  } catch {
    return fallback;
  }
}

export function getSiteConfig() {
  return safeJson<SiteConfig | null>('/site/config', null, 300);
}

export function getProducts(input: { search?: string; category?: string; brand?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (input.search?.trim()) params.set('search', input.search.trim());
  if (input.category) params.set('category', input.category);
  if (input.brand) params.set('brand', input.brand);
  return safeJson<ApiProduct[]>(`/catalog/products${params.size ? `?${params}` : ''}`, []);
}

export type ProductPage = {
  items: ApiProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: 'newest' | 'name_asc';
};

const emptyPage = (page: number, pageSize: number): ProductPage => ({ items: [], total: 0, page, pageSize, totalPages: 1, sort: 'newest' });

/** Busca paginada no servidor (filtros, ordenação e contagem). */
export function getProductsPage(input: {
  search?: string;
  category?: string;
  brand?: string;
  page?: number;
  pageSize?: number;
  sort?: 'newest' | 'name_asc';
} = {}): Promise<ProductPage> {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, input.pageSize ?? 12));
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (input.search?.trim()) params.set('search', input.search.trim());
  if (input.category) params.set('category', input.category);
  if (input.brand) params.set('brand', input.brand);
  if (input.sort) params.set('sort', input.sort);
  return safeJson<ProductPage>(`/catalog/products/search?${params}`, emptyPage(page, pageSize));
}

export async function getProduct(slug: string): Promise<ApiProduct | null> {
  try {
    return await getJson<ApiProduct>(`/catalog/products/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<ApiCategory[]> {
  return safeJson<ApiCategory[]>('/catalog/categories', []);
}

export async function getBrands(): Promise<ApiBrand[]> {
  return safeJson<ApiBrand[]>('/catalog/brands', []);
}

export async function getQuote(publicId: string): Promise<PublicQuote | null> {
  try {
    const response = await fetch(`${API_URL}/api/v1/quotes/${encodeURIComponent(publicId)}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as PublicQuote;
  } catch {
    return null;
  }
}
