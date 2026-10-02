INSERT INTO `Category` (`id`, `publicId`, `legacySource`, `legacyId`, `name`, `slug`, `status`, `createdAt`, `updatedAt`)
VALUES (
  'category_uncategorized_20261002',
  'public_category_uncategorized_20261002',
  'woocommerce',
  'uncategorized',
  'Uncategorized',
  'uncategorized',
  'ACTIVE',
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
)
ON DUPLICATE KEY UPDATE `id` = `id`;

INSERT IGNORE INTO `ProductCategory` (`productId`, `categoryId`)
SELECT product.`id`, category.`id`
FROM `Product` AS product
JOIN `Category` AS category ON category.`slug` = 'uncategorized'
WHERE product.`legacySource` = 'woocommerce'
  AND product.`legacyId` = '180';
