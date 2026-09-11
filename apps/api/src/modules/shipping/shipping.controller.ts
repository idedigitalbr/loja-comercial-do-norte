import { Body, Controller, Post } from '@nestjs/common';
import { IsInt, IsPostalCode, Min } from 'class-validator';
import { ShippingService } from './shipping.service';

class ShippingQuoteDto {
  @IsPostalCode('BR')
  postalCode!: string;

  @IsInt()
  @Min(0)
  totalCents!: number;
}

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('quote')
  quote(@Body() body: ShippingQuoteDto) {
    return this.shippingService.quote(body);
  }
}
