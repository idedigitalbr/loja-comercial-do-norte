-- Add WooCommerce-compatible stock controls to product variations.
ALTER TABLE `ProductVariant`
  ADD COLUMN `manageStock` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `stockStatus` ENUM('IN_STOCK', 'OUT_OF_STOCK', 'ON_BACKORDER') NOT NULL DEFAULT 'IN_STOCK',
  ADD COLUMN `lowStockThreshold` INTEGER NULL;
