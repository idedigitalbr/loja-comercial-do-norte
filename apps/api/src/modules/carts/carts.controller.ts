import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { Request, Response } from 'express';
import { AuthenticatedUser } from '../auth/auth.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { CartsService } from './carts.service';

class CartItemDto {
  @IsString()
  variantId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsInt()
  clientPriceCents?: number;
}

class QuantityDto {
  @IsInt()
  @Min(1)
  quantity!: number;
}

@Controller('carts')
export class CartsController {
  constructor(@Inject(CartsService) private readonly cartsService: CartsService) {}

  @Post()
  async create(@Res({ passthrough: true }) response: Response) {
    const cart = await this.cartsService.createAnonymousCart();
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookie('je_cart', cart.anonymousToken, {
      signed: true,
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    });
    return { publicId: cart.publicId };
  }

  @Get(':publicId')
  get(@Param('publicId') publicId: string) {
    return this.cartsService.getByPublicId(publicId);
  }

  @Post(':publicId/items')
  async addItem(@Param('publicId') publicId: string, @Body() body: CartItemDto) {
    const cart = await this.cartsService.getByPublicId(publicId);
    return this.cartsService.addItem({ cartId: cart.id, ...body });
  }

  @Patch(':publicId/items/:variantId')
  async updateItem(@Param('publicId') publicId: string, @Param('variantId') variantId: string, @Body() body: QuantityDto) {
    const cart = await this.cartsService.getByPublicId(publicId);
    return this.cartsService.updateItem(cart.id, variantId, body.quantity);
  }

  @Delete(':publicId/items/:variantId')
  async removeItem(@Param('publicId') publicId: string, @Param('variantId') variantId: string) {
    const cart = await this.cartsService.getByPublicId(publicId);
    return this.cartsService.removeItem(cart.id, variantId);
  }

  @UseGuards(SessionGuard)
  @Post(':publicId/merge')
  async merge(@Param('publicId') publicId: string, @Req() request: Request & { user: AuthenticatedUser }) {
    const cart = await this.cartsService.getByPublicId(publicId);
    return this.cartsService.mergeAfterLogin(cart.id, request.user.id);
  }
}
