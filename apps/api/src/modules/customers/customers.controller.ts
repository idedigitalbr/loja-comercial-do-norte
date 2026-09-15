import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CustomersService } from './customers.service';

@UseGuards(SessionGuard, PermissionGuard)
@RequirePermissions(Permissions.ORDERS_UPDATE)
@Controller('admin/customers')
export class CustomersController {
  constructor(@Inject(CustomersService) private readonly customersService: CustomersService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.customersService.list({ search });
  }

  @Get(':publicId')
  get360(@Param('publicId') publicId: string) {
    return this.customersService.get360ByPublicId(publicId);
  }
}
