import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductStockStatus, RecordStatus } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CatalogService, ProductImageInput, ProductVariantInput } from './catalog.service';

class ProductVariantInputDto implements ProductVariantInput {
  @IsOptional() @IsString() id?: string;
  @IsString() @Length(1, 100) sku!: string;
  @IsInt() @Min(0) priceCents!: number;
  @IsOptional() @IsInt() @Min(0) compareAtPriceCents?: number;
  @IsOptional() @IsInt() @Min(1) weightGrams?: number;
  @IsOptional() @IsInt() @Min(1) widthMm?: number;
  @IsOptional() @IsInt() @Min(1) heightMm?: number;
  @IsOptional() @IsInt() @Min(1) lengthMm?: number;
  @IsOptional() @IsInt() inventoryQuantity?: number;
  @IsOptional() @IsBoolean() manageStock?: boolean;
  @IsOptional() @IsEnum(ProductStockStatus) stockStatus?: ProductStockStatus;
  @IsOptional() @IsInt() @Min(0) lowStockThreshold?: number;
}

class ProductImageInputDto implements ProductImageInput {
  @IsString() path!: string;
  @IsOptional() @IsString() altText?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
  @IsOptional() @IsString() variantId?: string;
}

class ProductInputDto {
  @IsString()
  @Length(2, 220)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 191)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantInputDto)
  variants?: ProductVariantInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  images?: ProductImageInputDto[];
}

class TaxonomyInputDto {
  @IsString() @Length(2, 160) name!: string;
  @IsOptional() @IsString() @Length(2, 191) slug?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @Length(1, 500) imagePath?: string;
  @IsOptional() @IsEnum(RecordStatus) status?: RecordStatus;
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.PRODUCTS_WRITE)
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(@Inject(CatalogService) private readonly catalogService: CatalogService) {}

  @Get('products')
  listProducts(@Query('status') status?: RecordStatus) {
    return this.catalogService.listProducts({ status: status ?? null });
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }

  @Post('products')
  createProduct(@Body() body: ProductInputDto) {
    return this.catalogService.createProduct(body);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: ProductInputDto) {
    return this.catalogService.updateProduct(id, body);
  }

  @Post('products/:id/publish')
  publishProduct(@Param('id') id: string) {
    return this.catalogService.publish(id);
  }

  @Post('products/:id/archive')
  archiveProduct(@Param('id') id: string) {
    return this.catalogService.archiveProduct(id);
  }

  @Get('brands')
  listBrands(@Query('status') status?: RecordStatus) {
    return this.catalogService.listBrands(status ?? null);
  }

  @Get('brands/:id')
  getBrand(@Param('id') id: string) {
    return this.catalogService.getBrandById(id);
  }

  @Post('brands')
  createBrand(@Body() body: TaxonomyInputDto) {
    return this.catalogService.createBrand(body);
  }

  @Patch('brands/:id')
  updateBrand(@Param('id') id: string, @Body() body: TaxonomyInputDto) {
    return this.catalogService.updateBrand(id, body);
  }

  @Post('brands/:id/archive')
  archiveBrand(@Param('id') id: string) {
    return this.catalogService.archiveBrand(id);
  }

  @Get('categories')
  listCategories(@Query('status') status?: RecordStatus) {
    return this.catalogService.listCategories(status ?? null);
  }

  @Post('categories')
  createCategory(@Body() body: TaxonomyInputDto) {
    return this.catalogService.createCategory(body);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: TaxonomyInputDto) {
    return this.catalogService.updateCategory(id, body);
  }

  @Post('categories/:id/archive')
  archiveCategory(@Param('id') id: string) {
    return this.catalogService.archiveCategory(id);
  }
}
