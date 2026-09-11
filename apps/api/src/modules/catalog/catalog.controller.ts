import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

type ProductQuery = {
  search?: string;
  brandId?: string;
  categoryId?: string;
};

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  listProducts(@Query() query: ProductQuery) {
    return this.catalogService.listProducts(query);
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.catalogService.getProductBySlug(slug);
  }

  @Get('brands')
  listBrands() {
    return this.catalogService.listBrands();
  }

  @Get('categories')
  listCategories() {
    return this.catalogService.listCategories();
  }
}
