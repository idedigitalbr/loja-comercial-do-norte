import { Body, Controller, Headers, Inject, Post, UseGuards } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PermissionGuard, Permissions, RequirePermissions } from '../auth/guards/permission.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { PaymentsService } from './payments.service';

class CardPaymentDto {
  @IsString() orderId!: string;
  @IsInt() @Min(1) amountCents!: number;
  @IsString() cardToken!: string;
  @IsInt() @Min(1) installments!: number;
  @IsOptional() @IsString() paymentMethodId?: string;
}

class PixPaymentDto {
  @IsString() orderId!: string;
  @IsInt() @Min(1) amountCents!: number;
}

class RefundDto {
  @IsString() paymentId!: string;
  @IsInt() @Min(1) amountCents!: number;
  @IsString() reason!: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(@Inject(PaymentsService) private readonly paymentsService: PaymentsService) {}

  @Post('card')
  card(@Body() body: CardPaymentDto, @Headers('idempotency-key') idempotencyKey: string) {
    return this.paymentsService.payCard(body, idempotencyKey);
  }

  @Post('pix')
  pix(@Body() body: PixPaymentDto, @Headers('idempotency-key') idempotencyKey: string) {
    return this.paymentsService.payPix(body, idempotencyKey);
  }

  @UseGuards(SessionGuard, PermissionGuard)
  @RequirePermissions(Permissions.PAYMENTS_REFUND)
  @Post('refund')
  refund(@Body() body: RefundDto, @Headers('idempotency-key') idempotencyKey: string) {
    return this.paymentsService.refund(body, idempotencyKey);
  }
}
