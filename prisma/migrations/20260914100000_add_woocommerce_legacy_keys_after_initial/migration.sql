-- Apply the WooCommerce identifiers only after the initial schema exists.
-- Each statement is guarded so this also works for databases that already
-- received the original out-of-order migration.

SET @legacy_sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Brand') = 1
      AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'Brand' AND column_name = 'legacySource') = 0,
    'ALTER TABLE `Brand` ADD COLUMN `legacySource` VARCHAR(80) NULL',
    'SELECT 1'
  )
);
PREPARE legacy_stmt FROM @legacy_sql;
EXECUTE legacy_stmt;
DEALLOCATE PREPARE legacy_stmt;

SET @legacy_sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Brand') = 1
      AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'Brand' AND column_name = 'legacyId') = 0,
    'ALTER TABLE `Brand` ADD COLUMN `legacyId` VARCHAR(191) NULL',
    'SELECT 1'
  )
);
PREPARE legacy_stmt FROM @legacy_sql;
EXECUTE legacy_stmt;
DEALLOCATE PREPARE legacy_stmt;

SET @legacy_sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Category') = 1
      AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'Category' AND column_name = 'legacySource') = 0,
    'ALTER TABLE `Category` ADD COLUMN `legacySource` VARCHAR(80) NULL',
    'SELECT 1'
  )
);
PREPARE legacy_stmt FROM @legacy_sql;
EXECUTE legacy_stmt;
DEALLOCATE PREPARE legacy_stmt;

SET @legacy_sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Category') = 1
      AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'Category' AND column_name = 'legacyId') = 0,
    'ALTER TABLE `Category` ADD COLUMN `legacyId` VARCHAR(191) NULL',
    'SELECT 1'
  )
);
PREPARE legacy_stmt FROM @legacy_sql;
EXECUTE legacy_stmt;
DEALLOCATE PREPARE legacy_stmt;

SET @legacy_sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Product') = 1
      AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'Product' AND column_name = 'legacySource') = 0,
    'ALTER TABLE `Product` ADD COLUMN `legacySource` VARCHAR(80) NULL',
    'SELECT 1'
  )
);
PREPARE legacy_stmt FROM @legacy_sql;
EXECUTE legacy_stmt;
DEALLOCATE PREPARE legacy_stmt;

SET @legacy_sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Product') = 1
      AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'Product' AND column_name = 'legacyId') = 0,
    'ALTER TABLE `Product` ADD COLUMN `legacyId` VARCHAR(191) NULL',
    'SELECT 1'
  )
);
PREPARE legacy_stmt FROM @legacy_sql;
EXECUTE legacy_stmt;
DEALLOCATE PREPARE legacy_stmt;

SET @legacy_sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Brand') = 1
      AND (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'Brand' AND index_name = 'Brand_legacySource_legacyId_key') = 0,
    'ALTER TABLE `Brand` ADD UNIQUE INDEX `Brand_legacySource_legacyId_key` (`legacySource`, `legacyId`)',
    'SELECT 1'
  )
);
PREPARE legacy_stmt FROM @legacy_sql;
EXECUTE legacy_stmt;
DEALLOCATE PREPARE legacy_stmt;

SET @legacy_sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Category') = 1
      AND (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'Category' AND index_name = 'Category_legacySource_legacyId_key') = 0,
    'ALTER TABLE `Category` ADD UNIQUE INDEX `Category_legacySource_legacyId_key` (`legacySource`, `legacyId`)',
    'SELECT 1'
  )
);
PREPARE legacy_stmt FROM @legacy_sql;
EXECUTE legacy_stmt;
DEALLOCATE PREPARE legacy_stmt;

SET @legacy_sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'Product') = 1
      AND (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'Product' AND index_name = 'Product_legacySource_legacyId_key') = 0,
    'ALTER TABLE `Product` ADD UNIQUE INDEX `Product_legacySource_legacyId_key` (`legacySource`, `legacyId`)',
    'SELECT 1'
  )
);
PREPARE legacy_stmt FROM @legacy_sql;
EXECUTE legacy_stmt;
DEALLOCATE PREPARE legacy_stmt;
