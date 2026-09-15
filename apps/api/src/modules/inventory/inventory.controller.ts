import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsInt, IsString, Min } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { InventoryService } from './inventory.service';

class AdjustmentDto {
  @IsInt()
  quantity!: number;

  @IsString()
  reason!: string;
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.INVENTORY_ADJUST)
@Controller('admin/inventory')
export class InventoryController {
  constructor(@Inject(InventoryService) private readonly inventoryService: InventoryService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.inventoryService.list({ search });
  }

  @Post(':variantId/adjust')
  adjust(@Param('variantId') variantId: string, @Body() body: AdjustmentDto) {
    return this.inventoryService.adjust({ variantId, ...body });
  }
}
