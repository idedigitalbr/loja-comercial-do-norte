import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
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
  constructor(private readonly inventoryService: InventoryService) {}

  @Post(':variantId/adjust')
  adjust(@Param('variantId') variantId: string, @Body() body: AdjustmentDto) {
    return this.inventoryService.adjust({ variantId, ...body });
  }
}
