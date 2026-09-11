import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecordStatus } from '@prisma/client';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CatalogService } from './catalog.service';

class ProductInputDto {
  @IsString()
  @Length(2, 220)
  name!: string;

  @IsString()
  @Length(2, 191)
  slug!: string;

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
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.PRODUCTS_WRITE)
@Controller('admin/catalog')
export class AdminCatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  listProducts(@Query('status') status?: RecordStatus) {
    return this.catalogService.listProducts({ status });
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
}
