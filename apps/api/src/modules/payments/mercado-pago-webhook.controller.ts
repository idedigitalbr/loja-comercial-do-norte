import { Body, Controller, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PaymentsService } from './payments.service';

@Controller('webhooks/mercado-pago')
export class MercadoPagoWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':paymentId')
  receive(@Param('paymentId') paymentId: string, @Headers('x-signature') signature: string, @Body() payload: { eventId?: string; status?: 'approved' | 'pending' | 'rejected' }) {
    const expected = createHmac('sha256', process.env.MP_WEBHOOK_SECRET ?? 'development-webhook-secret').update(JSON.stringify(payload)).digest('hex');
    if (!signature || !payload.eventId || !payload.status || expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) throw new UnauthorizedException('INVALID_WEBHOOK');
    return this.paymentsService.processWebhook({ eventId: payload.eventId, paymentId, status: payload.status, payload: payload as Prisma.InputJsonValue });
  }
}
