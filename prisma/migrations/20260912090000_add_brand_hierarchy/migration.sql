-- Add an optional parent relation so WooCommerce brand taxonomies can be nested.
ALTER TABLE `Brand` ADD COLUMN `parentId` VARCHAR(191) NULL;

CREATE INDEX `Brand_parentId_status_idx` ON `Brand`(`parentId`, `status`);

ALTER TABLE `Brand`
  ADD CONSTRAINT `Brand_parentId_fkey`
  FOREIGN KEY (`parentId`) REFERENCES `Brand`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
