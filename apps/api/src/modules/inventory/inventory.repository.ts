export type InventoryBalanceSnapshot = {
  id: string;
  variantId: string;
  physicalQuantity: number;
  reservedQuantity: number;
};

/** SQL locking is intentionally kept in InventoryService transactions. */
export const availableQuantity = (balance: InventoryBalanceSnapshot) =>
  balance.physicalQuantity - balance.reservedQuantity;
