import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { PublicRateLimit, PublicRateLimitGuard } from '../../common/security/public-rate-limit.guard';
import { CatalogService } from './catalog.service';

type ProductQuery = {
  search?: string;
  brandId?: string;
  categoryId?: string;
  segmentId?: string;
  tagId?: string;
  brand?: string;
  category?: string;
  segment?: string;
  tag?: string;
};

type SearchQuery = {
  search?: string;
  brand?: string;
  category?: string;
  segment?: string;
  tag?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  offer?: string;
  oferta?: string;
};

@UseGuards(PublicRateLimitGuard)
@Controller('catalog')
export class CatalogController {
  constructor(@Inject(CatalogService) private readonly catalogService: CatalogService) {}

  @PublicRateLimit({ limit: 120, windowMs: 60_000 })
  @Get('products')
  listProducts(@Query() query: ProductQuery) {
    return this.catalogService.listProducts(query);
  }

  /** Busca paginada usada pelo storefront (server-side search/filtros). */
  @PublicRateLimit({ limit: 120, windowMs: 60_000 })
  @Get('products/search')
  searchProducts(@Query() query: SearchQuery) {
    const onlyOffers =
      query.offer === '1' ||
      query.offer === 'true' ||
      query.oferta === '1' ||
      query.oferta === 'true';

    return this.catalogService.searchProducts({
      search: query.search,
      brand: query.brand,
      category: query.category,
      segment: query.segment,
      tag: query.tag,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      sort:
        query.sort === 'name_asc'
          ? 'name_asc'
          : query.sort === 'mais_vendidos'
            ? 'mais_vendidos'
            : 'newest',
      onlyOffers,
    });
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }

  @Get('brands')
  listBrands() {
    return this.catalogService.listBrands();
  }

  @Get('segments')
  listSegments() {
    return this.catalogService.listSegments();
  }

  @Get('tags')
  listTags() {
    return this.catalogService.listTags();
  }

  /** Ofertas com preço "de/por" vindo da variante (S3). */
  @Get('offers')
  listOffers(@Query('limit') limit?: string) {
    return this.catalogService.listOffers(limit ? Number(limit) : undefined);
  }

  @Get('categories')
  listCategories() {
    return this.catalogService.listCategories();
  }
}
