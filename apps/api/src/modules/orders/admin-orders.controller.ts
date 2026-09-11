import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ActorType, OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { OrdersService } from './orders.service';

class StatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.ORDERS_UPDATE)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: StatusDto) {
    return this.ordersService.transition(id, body.status, { actorType: ActorType.USER, reason: body.reason, source: 'ADMIN' });
  }
}
