import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedUser } from '../auth/auth.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { AccountService } from './account.service';
import { AddFavoriteDto, ChangePasswordDto, CreateAddressDto, UpdateAddressDto, UpdateProfileDto } from './account.dto';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@UseGuards(SessionGuard)
@Controller('account')
export class AccountController {
  constructor(@Inject(AccountService) private readonly accountService: AccountService) {}

  @Get()
  summary(@Req() request: AuthenticatedRequest) {
    return this.accountService.getSummary(request.user.id);
  }

  @Patch('profile')
  profile(@Req() request: AuthenticatedRequest, @Body() body: UpdateProfileDto) {
    return this.accountService.updateProfile(request.user.id, body);
  }

  @Get('orders')
  orders(@Req() request: AuthenticatedRequest, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('status') status?: string) {
    return this.accountService.listOrders(request.user.id, { page, pageSize, status });
  }

  @Get('orders/:publicId')
  order(@Req() request: AuthenticatedRequest, @Param('publicId') publicId: string) {
    return this.accountService.getOrder(request.user.id, publicId);
  }

  @Get('addresses')
  addresses(@Req() request: AuthenticatedRequest) {
    return this.accountService.listAddresses(request.user.id);
  }

  @Post('addresses')
  createAddress(@Req() request: AuthenticatedRequest, @Body() body: CreateAddressDto) {
    return this.accountService.createAddress(request.user.id, body);
  }

  @Patch('addresses/:publicId')
  updateAddress(@Req() request: AuthenticatedRequest, @Param('publicId') publicId: string, @Body() body: UpdateAddressDto) {
    return this.accountService.updateAddress(request.user.id, publicId, body);
  }

  @Delete('addresses/:publicId')
  deleteAddress(@Req() request: AuthenticatedRequest, @Param('publicId') publicId: string) {
    return this.accountService.deleteAddress(request.user.id, publicId);
  }

  @Post('addresses/:publicId/default')
  defaultAddress(@Req() request: AuthenticatedRequest, @Param('publicId') publicId: string) {
    return this.accountService.setDefaultAddress(request.user.id, publicId);
  }

  @Get('favorites')
  favorites(@Req() request: AuthenticatedRequest) {
    return this.accountService.listFavorites(request.user.id);
  }

  @Post('favorites')
  addFavorite(@Req() request: AuthenticatedRequest, @Body() body: AddFavoriteDto) {
    return this.accountService.addFavorite(request.user.id, body);
  }

  @Delete('favorites/:productId')
  removeFavorite(@Req() request: AuthenticatedRequest, @Param('productId') productId: string) {
    return this.accountService.removeFavorite(request.user.id, productId);
  }

  @Patch('password')
  password(@Req() request: AuthenticatedRequest, @Body() body: ChangePasswordDto) {
    return this.accountService.changePassword(request.user.id, body.currentPassword, body.newPassword);
  }
}
