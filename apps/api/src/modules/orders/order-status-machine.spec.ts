import { OrderStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { canTransition } from './order-status-machine';

describe('OrderStatusMachine', () => {
  it.each([
    [OrderStatus.AWAITING_PAYMENT, OrderStatus.PAID, true],
    [OrderStatus.PAID, OrderStatus.PREPARING, true],
    [OrderStatus.SHIPPED, OrderStatus.AWAITING_PAYMENT, false],
    [OrderStatus.CANCELLED, OrderStatus.PAID, false],
  ])('%s -> %s', (from, to, allowed) => {
    expect(canTransition(from, to)).toBe(allowed);
  });
});
