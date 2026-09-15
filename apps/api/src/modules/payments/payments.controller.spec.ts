import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SessionGuard } from '../auth/guards/session.guard';

describe('PaymentsController', () => {
  it('resolves PaymentsService through its explicit Nest token', async () => {
    const paymentsService = { payPix: vi.fn().mockResolvedValue({ id: 'payment-1' }) };
    const module = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: paymentsService }],
    }).overrideGuard(SessionGuard).useValue({}).compile();

    const controller = module.get(PaymentsController);
    await controller.pix({ orderId: 'order-1', amountCents: 9900 }, 'pix-order-1');

    expect(paymentsService.payPix).toHaveBeenCalledWith({ orderId: 'order-1', amountCents: 9900 }, 'pix-order-1');
  });
});
