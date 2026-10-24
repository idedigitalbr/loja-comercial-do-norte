import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

type ProductQuery = {
  search?: string;
  brandId?: string;
  categoryId?: string;
  brand?: string;
  category?: string;
};

type SearchQuery = {
  search?: string;
  brand?: string;
  category?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
};

@Controller('catalog')
export class CatalogController {
  constructor(@Inject(CatalogService) private readonly catalogService: CatalogService) {}

  @Get('products')
  listProducts(@Query() query: ProductQuery) {
    return this.catalogService.listProducts(query);
  }

  /** Busca paginada usada pelo storefront (server-side search/filtros). */
  @Get('products/search')
  searchProducts(@Query() query: SearchQuery) {
    return this.catalogService.searchProducts({
      search: query.search,
      brand: query.brand,
      category: query.category,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      sort: query.sort === 'name_asc' ? 'name_asc' : 'newest',
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
