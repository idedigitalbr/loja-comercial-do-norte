import type { ApiBrand, ApiCategory, ApiProduct } from '@/lib/types';

export type WidgetType =
  | 'hero-carousel'
  | 'contained-hero'
  | 'benefits-bar'
  | 'product-carousel'
  | 'category-grid'
  | 'banner-grid'
  | 'brands-carousel'
  | 'quote-steps-banner'
  | 'segments-carousel'
  | 'promo-strip'
  | 'events-carousel'
  | 'video-articles-carousel'
  | 'instagram-feed'
  | 'testimonials-grid'
  | 'store-locations-map';

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
  widgetId?: string;
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
  widgetId?: string;
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
  widgetId?: string;
  items: BenefitItem[];
}
export type BenefitsBarWidgetConfig = BaseWidgetConfig<'benefits-bar', BenefitsBarProps>;

export interface ProductCarouselSideBanner {
  title: string;
  subtitle?: string;
  tag?: string;
  imageUrl: string;
  linkUrl: string;
  altText?: string;
}

export interface ProductCarouselProps {
  widgetId?: string;
  variant?: 'standard-5col' | 'split-banner';
  title: string;
  subtitle?: string;
  badge?: string;
  viewAllLink?: string;
  source: 'offers' | 'featured' | 'category' | 'recent';
  categoryId?: string;
  limit?: number;
  showCountdown?: boolean;
  countdownTargetHours?: number;
  sideBanner?: ProductCarouselSideBanner;
}
export type ProductCarouselWidgetConfig = BaseWidgetConfig<'product-carousel', ProductCarouselProps>;

export interface CategoryIconItem {
  id: string;
  label: string;
  imageUrl: string;
  linkUrl: string;
}

export interface CategoryGridProps {
  widgetId?: string;
  variant?: 'icons-bar' | 'cards';
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  columns?: 2 | 3 | 4 | 6 | 7 | 8;
  maxItems?: number;
  customItems?: CategoryIconItem[];
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
  widgetId?: string;
  columns?: 2 | 3;
  banners: PromotionalBanner[];
}
export type BannerGridWidgetConfig = BaseWidgetConfig<'banner-grid', BannerGridProps>;

export interface BrandsCarouselProps {
  widgetId?: string;
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
}
export type BrandsCarouselWidgetConfig = BaseWidgetConfig<'brands-carousel', BrandsCarouselProps>;

export interface QuoteStepItem {
  stepNumber: number;
  title: string;
  description: string;
}

export interface QuoteStepsBannerProps {
  widgetId?: string;
  eyebrow?: string;
  title?: string;
  steps?: QuoteStepItem[];
  mascotImageUrl?: string;
  rightArtworkImageUrl?: string;
  ctaUrl?: string;
  imageUrl?: string;
  altText?: string;
}
export type QuoteStepsBannerWidgetConfig = BaseWidgetConfig<'quote-steps-banner', QuoteStepsBannerProps>;

export interface SegmentCardItem {
  id: string;
  prefix: string;
  title: string;
  description: string;
  iconType: 'burger' | 'pizza' | 'bakery' | 'party' | 'buffet' | 'confectionery' | 'icecream' | 'bar';
  imageUrl: string;
  linkUrl: string;
}

export interface SegmentsCarouselProps {
  widgetId?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaUrl?: string;
  items: SegmentCardItem[];
}
export type SegmentsCarouselWidgetConfig = BaseWidgetConfig<'segments-carousel', SegmentsCarouselProps>;

export interface PromoStripBadge {
  label: string;
  icon?: 'tag' | 'grid' | 'whatsapp' | 'percent' | 'clock' | 'truck';
}

export interface PromoStripProps {
  widgetId?: string;
  variant: 'offers-strip' | 'conditions-mascot' | 'whatsapp-group';
  title?: string;
  highlightText?: string;
  subtitle?: string;
  badges?: PromoStripBadge[];
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
  altText?: string;
  mascotImageUrl?: string;
  rightImageUrl?: string;
}
export type PromoStripWidgetConfig = BaseWidgetConfig<'promo-strip', PromoStripProps>;

export interface EventPosterItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

export interface EventsCarouselProps {
  widgetId?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaUrl?: string;
  topThumbUrl?: string;
  items: EventPosterItem[];
}
export type EventsCarouselWidgetConfig = BaseWidgetConfig<'events-carousel', EventsCarouselProps>;

export interface VideoArticleItem {
  id: string;
  tags: string[];
  title: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
  imageUrl: string;
  videoUrl?: string;
}

export interface VideoArticlesCarouselProps {
  widgetId?: string;
  title: string;
  subtitle: string;
  viewAllLabel: string;
  viewAllUrl: string;
  items: VideoArticleItem[];
  mascotImageUrl?: string;
  bgImageUrl?: string;
}
export type VideoArticlesCarouselWidgetConfig = BaseWidgetConfig<'video-articles-carousel', VideoArticlesCarouselProps>;

export interface InstagramFeedItem {
  id: string;
  label: string;
  imageUrl: string;
  linkUrl: string;
}

export interface InstagramFeedProps {
  widgetId?: string;
  title: string;
  subtitle: string;
  handleLabel: string;
  handleUrl: string;
  items: InstagramFeedItem[];
}
export type InstagramFeedWidgetConfig = BaseWidgetConfig<'instagram-feed', InstagramFeedProps>;

export interface TestimonialItem {
  id: string;
  authorName: string;
  authorHandle: string;
  timeAgo?: string;
  avatarInitials: string;
  avatarColor?: string;
  rating: number;
  text: string;
}

export interface TestimonialsGridProps {
  widgetId?: string;
  eyebrow: string;
  title: string;
  ratingSummary: string;
  totalReviewsLabel: string;
  items: TestimonialItem[];
}
export type TestimonialsGridWidgetConfig = BaseWidgetConfig<'testimonials-grid', TestimonialsGridProps>;

export interface StoreLocationItem {
  id: string;
  name: string;
  eyebrow?: string;
  displayTitle?: string;
  subtitle?: string;
  ratingText?: string;
  imageUrl?: string;
  badge: string;
  isFeatured?: boolean;
  address: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  phone: string;
  whatsappUrl: string;
  mapQueryUrl: string;
  mapEmbedUrl?: string;
  lat?: number;
  lng?: number;
}

export interface StoreLocationsMapProps {
  widgetId?: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  mapEmbedUrl: string;
  locations: StoreLocationItem[];
  referenceDate?: Date;
}
export type StoreLocationsMapWidgetConfig = BaseWidgetConfig<'store-locations-map', StoreLocationsMapProps>;

export type WidgetConfig =
  | HeroCarouselWidgetConfig
  | ContainedHeroWidgetConfig
  | BenefitsBarWidgetConfig
  | ProductCarouselWidgetConfig
  | CategoryGridWidgetConfig
  | BannerGridWidgetConfig
  | BrandsCarouselWidgetConfig
  | QuoteStepsBannerWidgetConfig
  | SegmentsCarouselWidgetConfig
  | PromoStripWidgetConfig
  | EventsCarouselWidgetConfig
  | VideoArticlesCarouselWidgetConfig
  | InstagramFeedWidgetConfig
  | TestimonialsGridWidgetConfig
  | StoreLocationsMapWidgetConfig;

export interface PageComposition {
  page: string;
  version: number;
  widgets: WidgetConfig[];
}

export interface StorefrontRevision {
  id: string;
  createdAt: string;
  authorName: string;
  authorEmail: string;
  widgetsCount: number;
  note?: string;
  composition: PageComposition;
}

export interface WidgetContextData {
  categories: ApiCategory[];
  brands: ApiBrand[];
  offers: ApiProduct[];
  products: ApiProduct[];
}
