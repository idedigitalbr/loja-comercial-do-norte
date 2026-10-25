import type { ApiBrand, ApiCategory, ApiProduct } from '@/lib/types';

export type WidgetType =
  | 'hero-carousel'
  | 'contained-hero'
  | 'benefits-bar'
  | 'product-carousel'
  | 'category-grid'
  | 'banner-grid'
  | 'brands-carousel';

export interface BaseWidgetConfig<TType extends WidgetType, TProps> {
  id: string;
  type: TType;
  enabled: boolean;
  order: number;
  props: TProps;
}

export interface HeroSlide {
  id: string;
  title: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl: string;
  altText: string;
  badge?: string;
  backgroundColor?: string;
}

export interface HeroCarouselProps {
  slides: HeroSlide[];
  autoplayIntervalMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
  bottomGradient?: boolean;
}
export type HeroCarouselWidgetConfig = BaseWidgetConfig<'hero-carousel', HeroCarouselProps>;

export interface ContainedHeroSlide {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
}

export interface ContainedHeroProps {
  slides: ContainedHeroSlide[];
  autoplayIntervalMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
  overlapTop?: boolean;
}
export type ContainedHeroWidgetConfig = BaseWidgetConfig<'contained-hero', ContainedHeroProps>;

export interface BenefitItem {
  iconName: 'truck' | 'store' | 'tag' | 'shield' | 'package' | 'clock';
  title: string;
  description: string;
}

export interface BenefitsBarProps {
  items: BenefitItem[];
}
export type BenefitsBarWidgetConfig = BaseWidgetConfig<'benefits-bar', BenefitsBarProps>;

export interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  badge?: string;
  viewAllLink?: string;
  source: 'offers' | 'featured' | 'category' | 'recent';
  categoryId?: string;
  limit?: number;
  showCountdown?: boolean;
  countdownTargetHours?: number;
}
export type ProductCarouselWidgetConfig = BaseWidgetConfig<'product-carousel', ProductCarouselProps>;

export interface CategoryGridProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  columns?: 2 | 3 | 4 | 6;
  maxItems?: number;
}
export type CategoryGridWidgetConfig = BaseWidgetConfig<'category-grid', CategoryGridProps>;

export interface PromotionalBanner {
  id: string;
  title?: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  tag?: string;
}

export interface BannerGridProps {
  columns: 2 | 3;
  banners: PromotionalBanner[];
}
export type BannerGridWidgetConfig = BaseWidgetConfig<'banner-grid', BannerGridProps>;

export interface BrandsCarouselProps {
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
}
export type BrandsCarouselWidgetConfig = BaseWidgetConfig<'brands-carousel', BrandsCarouselProps>;

export type WidgetConfig =
  | HeroCarouselWidgetConfig
  | ContainedHeroWidgetConfig
  | BenefitsBarWidgetConfig
  | ProductCarouselWidgetConfig
  | CategoryGridWidgetConfig
  | BannerGridWidgetConfig
  | BrandsCarouselWidgetConfig;

export interface PageComposition {
  page: string;
  version: number;
  widgets: WidgetConfig[];
}

export interface WidgetContextData {
  categories: ApiCategory[];
  brands: ApiBrand[];
  offers: ApiProduct[];
  products: ApiProduct[];
}
