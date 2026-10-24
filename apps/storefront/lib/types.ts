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
  priceCents: number;
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
};

export type ApiBrand = {
  id: string;
  publicId: string;
  name: string;
  slug: string;
  imagePath: string | null;
  parentId: string | null;
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
};

export type PublicQuote = {
  publicId: string;
  status: string;
  customerName: string;
  customerPhone: string;
  companyName: string | null;
  itemsCount: number;
  subtotalCents: number;
  notes: string | null;
  createdAt: string;
  answeredAt: string | null;
  items: Array<{
    productName: string;
    productSlug: string;
    sku: string;
    imagePath: string | null;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
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
