import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import type { Request } from 'express';
import { AuthenticatedUser } from '../auth/auth.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { OrdersService } from './orders.service';

class CreateOrderDto {
  @IsString()
  cartId!: string;

  @IsEmail()
  contactEmail!: string;
}

@Controller('orders')
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  @UseGuards(SessionGuard)
  @Post()
  create(@Body() body: CreateOrderDto, @Req() request: Request & { user: AuthenticatedUser }) {
    return this.ordersService.createFromCart({ ...body, userId: request.user.id });
  }

  @UseGuards(SessionGuard)
  @Get(':publicId')
  get(@Param('publicId') publicId: string) {
    return this.ordersService.getByPublicId(publicId);
  }

  @UseGuards(SessionGuard)
  @Get()
  list(@Req() request: Request & { user: AuthenticatedUser }) {
    return this.ordersService.listForUser(request.user.id);
  }
}
