export type ApiImage = {
  id: string;
  path: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  variantId: string | null;
};

export type ApiVariant = {
  id: string;
  publicId: string;
  sku: string;
  variantName?: string | null;
  pricingMode?: 'QUOTE_ONLY' | 'FIXED_PRICE';
  priceCents: number | null;
  gtinRaw?: string | null;
  manufacturerRef?: string | null;
  color?: string | null;
  sizeOrModel?: string | null;
  capacityOrVolume?: string | null;
  material?: string | null;
  packagingRaw?: string | null;
  reportedNetWeight?: string | null;
  dimensionsRaw?: string | null;
  freightReady?: boolean;
  compareAtPriceCents: number | null;
  weightGrams: number | null;
  widthMm: number | null;
  heightMm: number | null;
  lengthMm: number | null;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER';
  status: string;
  inventoryBalance?: { physicalQuantity: number; reservedQuantity: number } | null;
};

export type ApiProduct = {
  id: string;
  publicId: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  brand: { id: string; name: string; slug: string } | null;
  categories: Array<{ category: { id: string; name: string; slug: string } }>;
  variants: ApiVariant[];
  images: ApiImage[];
};

export type ApiCategory = {
  id: string;
  publicId: string;
  name: string;
  slug: string;
  parentId: string | null;
  imagePath: string | null;
  sortOrder: number;
  children?: ApiCategory[];
  _count?: {
    products?: number;
    children?: number;
  };
};

export type ApiBrand = {
  id: string;
  publicId: string;
  name: string;
  slug: string;
  description?: string | null;
  imagePath: string | null;
  parentId: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  children?: ApiBrand[];
  _count?: {
    products?: number;
    children?: number;
  };
};

export type ApiSegment = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imagePath?: string | null;
  sortOrder?: number;
  _count?: {
    products?: number;
  };
};

export type ApiTag = {
  id: string;
  name: string;
  slug: string;
};

export type SiteConfig = {
  site: {
    siteName: string;
    logoPath: string | null;
    faviconPath: string | null;
    address: string | null;
    phone: string | null;
    whatsapp: string | null;
    instagramUrl: string | null;
    title: string | null;
    description: string | null;
  };
  banners: Array<{
    id: string;
    desktopPath: string;
    mobilePath: string | null;
    eyebrow: string | null;
    title: string | null;
    description: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    sortOrder: number;
  }>;
  features?: {
    checkout: boolean;
    payments: boolean;
    trainings: boolean;
  };
};

export type PublicQuote = {
  publicId: string;
  status: string;
  customerName: string;
  customerPhone: string;
  companyName: string | null;
  itemsCount: number;
  subtotalCents: number | null;
  notes: string | null;
  createdAt: string;
  answeredAt: string | null;
  items: Array<{
    productName: string;
    productSlug: string;
    sku: string;
    imagePath: string | null;
    quantity: number;
    unitPriceCents: number | null;
    totalCents: number | null;
  }>;
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Cotação recebida',
  IN_REVIEW: 'Em análise pela equipe',
  ANSWERED: 'Proposta enviada',
  WON: 'Negócio fechado',
  LOST: 'Não aprovada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
};
