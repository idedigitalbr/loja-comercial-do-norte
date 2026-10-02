export type AccountProfile = {
  firstName: string;
  lastName: string;
  phone: string | null;
};

export type AccountAddress = {
  publicId: string;
  label: string;
  recipientName: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export type AccountOrderSummary = {
  publicId: string;
  status: string;
  totalCents: number;
  createdAt: string;
};

export type AccountSummary = {
  user: { publicId: string; email: string; createdAt: string; profile: AccountProfile | null };
  metrics: { orderCount: number; favoriteCount: number; totalSpentCents: number };
  defaultAddress: AccountAddress | null;
  lastOrder: AccountOrderSummary | null;
};

export type AccountOrder = AccountOrderSummary & {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  contactEmail: string;
  shippingMethodCode: string | null;
  shippingDays: number | null;
  shippingAddressJson: Record<string, string> | null;
  items: Array<{ id: string; name: string; sku: string | null; quantity: number; unitPriceCents: number; totalCents: number; variant: { product: { slug: string; name: string } } | null }>;
  payments: Array<{ publicId: string; method: 'CARD' | 'PIX'; status: string; amountCents: number; expiresAt: string | null }>;
  statusHistory: Array<{ id: string; fromStatus: string | null; toStatus: string; reason: string | null; createdAt: string }>;
};

export type AccountFavorite = {
  id: string;
  createdAt: string;
  product: {
    publicId: string;
    slug: string;
    name: string;
    status: string;
    brand: { name: string } | null;
    images: Array<{ path: string; altText: string | null }>;
    variants: Array<{ priceCents: number; compareAtPriceCents: number | null; stockStatus: string }>;
  };
};

export type AccountOrdersResponse = { items: AccountOrder[]; total: number; page: number; pageSize: number; pageCount: number };

export class AccountApiError extends Error {
  constructor(readonly status: number, readonly code?: string, message = 'Não foi possível carregar os dados da conta.') {
    super(message);
    this.name = 'AccountApiError';
  }
}

async function accountRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  let response: Response;
  try {
    response = await fetch(`/api/v1/account${path}`, { ...init, headers, credentials: 'include' });
  } catch {
    throw new AccountApiError(0, 'NETWORK_ERROR', 'Não foi possível conectar agora. Tente novamente.');
  }

  if (!response.ok) {
    let payload: { code?: string; message?: string } = {};
    try { payload = await response.json() as typeof payload; } catch { /* resposta sem corpo */ }
    throw new AccountApiError(response.status, payload.code, response.status === 401 ? 'Sua sessão expirou. Entre novamente para continuar.' : payload.message);
  }
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

export const accountApi = {
  summary: () => accountRequest<AccountSummary>(''),
  updateProfile: (input: { firstName: string; lastName: string; phone: string }) => accountRequest<{ publicId: string; email: string; profile: AccountProfile }>('/profile', { method: 'PATCH', body: JSON.stringify(input) }),
  orders: (params: { page?: number; pageSize?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.status) query.set('status', params.status);
    return accountRequest<AccountOrdersResponse>(`/orders${query.size ? `?${query.toString()}` : ''}`);
  },
  order: (publicId: string) => accountRequest<AccountOrder>(`/orders/${encodeURIComponent(publicId)}`),
  addresses: () => accountRequest<AccountAddress[]>('/addresses'),
  createAddress: (input: Record<string, unknown>) => accountRequest<AccountAddress>('/addresses', { method: 'POST', body: JSON.stringify(input) }),
  updateAddress: (publicId: string, input: Record<string, unknown>) => accountRequest<AccountAddress>(`/addresses/${encodeURIComponent(publicId)}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteAddress: (publicId: string) => accountRequest<{ deleted: boolean }>(`/addresses/${encodeURIComponent(publicId)}`, { method: 'DELETE' }),
  setDefaultAddress: (publicId: string) => accountRequest<AccountAddress>(`/addresses/${encodeURIComponent(publicId)}/default`, { method: 'POST' }),
  favorites: () => accountRequest<AccountFavorite[]>('/favorites'),
  addFavorite: (productId: string) => accountRequest<AccountFavorite[]>('/favorites', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFavorite: (productId: string) => accountRequest<{ deleted: boolean }>(`/favorites/${encodeURIComponent(productId)}`, { method: 'DELETE' }),
  changePassword: (input: { currentPassword: string; newPassword: string }) => accountRequest<{ ok: boolean }>('/password', { method: 'PATCH', body: JSON.stringify(input) }),
};
