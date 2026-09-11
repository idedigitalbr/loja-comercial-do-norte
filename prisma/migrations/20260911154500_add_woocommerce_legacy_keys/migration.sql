ALTER TABLE `Brand`
  ADD COLUMN `legacySource` VARCHAR(80) NULL,
  ADD COLUMN `legacyId` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `Brand_legacySource_legacyId_key` (`legacySource`, `legacyId`);

ALTER TABLE `Category`
  ADD COLUMN `legacySource` VARCHAR(80) NULL,
  ADD COLUMN `legacyId` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `Category_legacySource_legacyId_key` (`legacySource`, `legacyId`);

ALTER TABLE `Product`
  ADD COLUMN `legacySource` VARCHAR(80) NULL,
  ADD COLUMN `legacyId` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `Product_legacySource_legacyId_key` (`legacySource`, `legacyId`);
