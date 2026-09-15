-- Add editorial data and a square media reference for main catalog brands.
ALTER TABLE `Brand`
  ADD COLUMN `description` TEXT NULL,
  ADD COLUMN `imagePath` VARCHAR(500) NULL;
