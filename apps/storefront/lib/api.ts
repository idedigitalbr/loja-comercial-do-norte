import type { ApiBrand, ApiCategory, ApiProduct, ApiSegment, ApiTag, PublicQuote, SiteConfig } from './types';

/**
 * URL da API NestJS (fonte única de regra de negócio). O storefront só consome
 * REST: nunca acessa banco nem duplica regra comercial.
 */
export const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/** Janelas de cache ISR (segundos) e tags de revalidação por domínio. */
export const REVALIDATE_WINDOWS = {
  SITE_CONFIG: 300,
  TAXONOMY: 180,
  CATALOG: 60,
  OFFERS: 60,
} as const;

export const CACHE_TAGS = {
  SITE_CONFIG: 'site-config',
  PRODUCTS: 'catalog-products',
  CATEGORIES: 'catalog-categories',
  BRANDS: 'catalog-brands',
  OFFERS: 'catalog-offers',
} as const;

/** Converte o caminho salvo no banco (`uploads/...`) na URL pública da API. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${API_URL}/storage/${path.replace(/^\/+/, '')}`;
}

type FetchCacheOptions = {
  revalidate?: number;
  tags?: string[];
};

async function getJson<T>(path: string, options: FetchCacheOptions = {}): Promise<T> {
  const { revalidate = REVALIDATE_WINDOWS.CATALOG, tags } = options;
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    headers: { accept: 'application/json' },
    next: tags?.length ? { revalidate, tags } : { revalidate },
  });
  if (!response.ok) throw new Error(`API ${response.status} em ${path}`);
  return response.json() as Promise<T>;
}

/** Variante tolerante a falha: a página renderiza um estado vazio/aviso. */
async function safeJson<T>(path: string, fallback: T, options: FetchCacheOptions = {}): Promise<T> {
  try {
    return await getJson<T>(path, options);
  } catch {
    return fallback;
  }
}

export function getSiteConfig() {
  return safeJson<SiteConfig | null>('/site/config', null, {
    revalidate: REVALIDATE_WINDOWS.SITE_CONFIG,
    tags: [CACHE_TAGS.SITE_CONFIG],
  });
}

export function getProducts(input: { search?: string; category?: string; brand?: string; segment?: string; tag?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (input.search?.trim()) params.set('search', input.search.trim());
  if (input.category) params.set('category', input.category);
  if (input.brand) params.set('brand', input.brand);
  if (input.segment) params.set('segment', input.segment);
  if (input.tag) params.set('tag', input.tag);
  return safeJson<ApiProduct[]>(`/catalog/products${params.size ? `?${params}` : ''}`, [], {
    revalidate: REVALIDATE_WINDOWS.CATALOG,
    tags: [CACHE_TAGS.PRODUCTS],
  });
}

export type ProductPage = {
  items: ApiProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: string;
};

const emptyPage = (page: number, pageSize: number): ProductPage => ({ items: [], total: 0, page, pageSize, totalPages: 1, sort: 'newest' });

/** Busca paginada no servidor (filtros, ordenação e contagem). */
export function getProductsPage(input: {
  search?: string;
  category?: string;
  brand?: string;
  segment?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  offer?: boolean | string;
} = {}): Promise<ProductPage> {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, input.pageSize ?? 12));
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (input.search?.trim()) params.set('search', input.search.trim());
  if (input.category) params.set('category', input.category);
  if (input.brand) params.set('brand', input.brand);
  if (input.segment) params.set('segment', input.segment);
  if (input.tag) params.set('tag', input.tag);
  if (input.sort) params.set('sort', input.sort);
  if (input.offer) params.set('offer', '1');
  return safeJson<ProductPage>(`/catalog/products/search?${params}`, emptyPage(page, pageSize), {
    revalidate: REVALIDATE_WINDOWS.CATALOG,
    tags: [CACHE_TAGS.PRODUCTS],
  });
}

export async function getProduct(slug: string): Promise<ApiProduct | null> {
  try {
    return await getJson<ApiProduct>(`/catalog/products/${encodeURIComponent(slug)}`, {
      revalidate: REVALIDATE_WINDOWS.CATALOG,
      tags: [CACHE_TAGS.PRODUCTS, `product:${slug}`],
    });
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<ApiCategory[]> {
  return safeJson<ApiCategory[]>('/catalog/categories', [], {
    revalidate: REVALIDATE_WINDOWS.TAXONOMY,
    tags: [CACHE_TAGS.CATEGORIES],
  });
}

export async function getBrands(): Promise<ApiBrand[]> {
  return safeJson<ApiBrand[]>('/catalog/brands', [], {
    revalidate: REVALIDATE_WINDOWS.TAXONOMY,
    tags: [CACHE_TAGS.BRANDS],
  });
}

/** Ofertas reais (variante com preço "de/por"), sem inventar desconto. */
export async function getOffers(limit = 8): Promise<ApiProduct[]> {
  return safeJson<ApiProduct[]>(`/catalog/offers?limit=${limit}`, [], {
    revalidate: REVALIDATE_WINDOWS.OFFERS,
    tags: [CACHE_TAGS.OFFERS, CACHE_TAGS.PRODUCTS],
  });
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

export type { ApiSegment, ApiTag };
export async function getSegments(): Promise<ApiSegment[]> {
  return safeJson<ApiSegment[]>('/catalog/segments', [], {
    revalidate: REVALIDATE_WINDOWS.TAXONOMY,
    tags: [CACHE_TAGS.CATEGORIES],
  });
}

export async function getTags(): Promise<ApiTag[]> {
  return safeJson<ApiTag[]>('/catalog/tags', [], {
    revalidate: REVALIDATE_WINDOWS.TAXONOMY,
    tags: [CACHE_TAGS.CATEGORIES],
  });
}


export type ApiPostCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { posts: number };
};

export type ApiPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverUrl?: string | null;
  videoUrl?: string | null;
  videoDuration?: string | null;
  authorName?: string | null;
  badges: string[];
  status: string;
  publishedAt: string;
  views: number;
  category?: { id: string; name: string; slug: string; description?: string | null } | null;
};

export type ApiPostsResponse = {
  items: ApiPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ApiEvent = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description: string;
  posterUrl?: string | null;
  eventDate?: string | null;
  eventDateText?: string | null;
  eventTime?: string | null;
  location?: string | null;
  locationAddress?: string | null;
  instructor?: string | null;
  badge?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  status: string;
  sortOrder: number;
  categoryKey?: string | null;
};

export async function getPosts(params?: { search?: string; category?: string; page?: number; pageSize?: number }): Promise<ApiPostsResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  const queryString = query.toString();
  return safeJson<ApiPostsResponse>(`/posts${queryString ? `?${queryString}` : ''}`, {
    items: [],
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 1,
  });
}

export async function getPostBySlug(slug: string): Promise<ApiPost | null> {
  try {
    return await getJson<ApiPost>(`/posts/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function getPostCategories(): Promise<ApiPostCategory[]> {
  return safeJson<ApiPostCategory[]>('/posts/categories', []);
}

export async function getEvents(params?: { search?: string }): Promise<ApiEvent[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  const queryString = query.toString();
  return safeJson<ApiEvent[]>(`/events${queryString ? `?${queryString}` : ''}`, []);
}

export async function getEventBySlug(slug: string): Promise<ApiEvent | null> {
  try {
    return await getJson<ApiEvent>(`/events/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}
