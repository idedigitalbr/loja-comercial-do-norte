import { OrderStatus } from '@prisma/client';

const transitions: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: [OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED],
  AWAITING_PAYMENT: [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID: [OrderStatus.PREPARING, OrderStatus.REFUNDED],
  PREPARING: [OrderStatus.SHIPPED, OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.COMPLETED],
  READY_FOR_PICKUP: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
  PARTIALLY_REFUNDED: [OrderStatus.REFUNDED],
  REFUNDED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}
