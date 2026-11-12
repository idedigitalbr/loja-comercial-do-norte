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
import { CatalogAuditHealth, PricingMode, ProductStockStatus, RecordStatus } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Length, Min, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CatalogService, ProductImageInput, ProductVariantInput } from './catalog.service';

class ProductVariantInputDto implements ProductVariantInput {
  @IsOptional() @IsString() id?: string;
  @IsString() @Length(1, 100) sku!: string;
  @IsOptional() @IsString() variantName?: string | null;
  @IsOptional() @IsEnum(PricingMode) pricingMode?: PricingMode;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(0) priceCents?: number | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(0) compareAtPriceCents?: number | null;
  @IsOptional() @IsString() gtinRaw?: string | null;
  @IsOptional() @IsString() gtinStatus?: string | null;
  @IsOptional() @IsBoolean() gtinValid?: boolean | null;
  @IsOptional() @IsString() manufacturerRef?: string | null;
  @IsOptional() @IsString() ncm?: string | null;
  @IsOptional() @IsString() color?: string | null;
  @IsOptional() @IsString() sizeOrModel?: string | null;
  @IsOptional() @IsString() capacityOrVolume?: string | null;
  @IsOptional() @IsString() material?: string | null;
  @IsOptional() @IsString() packagingRaw?: string | null;
  @IsOptional() @IsString() packagingType?: string | null;
  @IsOptional() @IsString() packagingUnit?: string | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(0) packagingFactor1?: number | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(0) packagingFactor2?: number | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(0) packagingTotalUnits?: number | null;
  @IsOptional() @IsString() reportedNetWeight?: string | null;
  @IsOptional() @IsString() dimensionsRaw?: string | null;
  @IsOptional() @IsString() internalDimensions?: string | null;
  @IsOptional() @IsString() externalDimensions?: string | null;
  @IsOptional() @IsString() diameterText?: string | null;
  @IsOptional() @IsString() heightText?: string | null;
  @IsOptional() @IsString() individualVolumeText?: string | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(1) weightGrams?: number | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(1) widthMm?: number | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(1) heightMm?: number | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(1) lengthMm?: number | null;
  @IsOptional() @IsInt() inventoryQuantity?: number;
  @IsOptional() @IsBoolean() manageStock?: boolean;
  @IsOptional() @IsEnum(ProductStockStatus) stockStatus?: ProductStockStatus;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(0) lowStockThreshold?: number | null;
  @IsOptional() @IsArray() @IsString({ each: true }) extraIssueCodes?: string[];
}

class ProductImageInputDto implements ProductImageInput {
  @IsString() path!: string;
  @IsOptional() @IsString() altText?: string | null;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
  @IsOptional() @IsString() variantId?: string | null;
  @IsOptional() @IsString() imageStatus?: string | null;
  @IsOptional() @IsString() imageSourceMethod?: string | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(0) imageConfidence?: number | null;
  @IsOptional() @IsString() sha256?: string | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(1) widthPx?: number | null;
  @ValidateIf((_, value) => value !== undefined && value !== null) @IsInt() @Min(1) heightPx?: number | null;
  @IsOptional() @IsString() sourceOriginalPath?: string | null;
}

class ProductInputDto {
  @IsString()
  @Length(2, 220)
  name!: string;

  @IsOptional()
  @IsString()
  rawCatalogName?: string | null;

  @IsOptional()
  @IsString()
  @Length(2, 191)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  rawDescription?: string | null;

  @IsOptional()
  @IsString()
  brandId?: string | null;

  @IsOptional()
  @IsString()
  brandMatchNote?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsInt()
  @Min(1)
  sourcePdfPage?: number | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsInt()
  @Min(1)
  sourcePrintedPage?: number | null;

  @IsOptional()
  @IsString()
  sourceSection?: string | null;

  @IsOptional()
  @IsString()
  sourceRawText?: string | null;

  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsInt()
  @Min(0)
  auditConfidence?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraIssueCodes?: string[];

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
  listProducts(
    @Query('status') status?: RecordStatus,
    @Query('health') health?: CatalogAuditHealth,
    @Query('issueCode') issueCode?: string,
  ) {
    return this.catalogService.listProducts({
      status: status ?? null,
      ...(health ? { health } : {}),
      ...(issueCode ? { issueCode } : {}),
    });
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

  @Get('tags')
  listTags(@Query('status') status?: RecordStatus) {
    return this.catalogService.listTags(status ?? null);
  }

  @Get('tags/:id')
  getTag(@Param('id') id: string) {
    return this.catalogService.getTagById(id);
  }

  @Post('tags')
  createTag(@Body() body: TaxonomyInputDto) {
    return this.catalogService.createTag(body);
  }

  @Patch('tags/:id')
  updateTag(@Param('id') id: string, @Body() body: TaxonomyInputDto) {
    return this.catalogService.updateTag(id, body);
  }

  @Post('tags/:id/archive')
  archiveTag(@Param('id') id: string) {
    return this.catalogService.archiveTag(id);
  }
}
