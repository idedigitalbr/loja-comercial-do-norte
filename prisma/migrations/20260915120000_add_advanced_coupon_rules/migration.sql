ALTER TABLE `Coupon`
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `discountType` ENUM('PERCENTAGE', 'FIXED_CART', 'FIXED_PRODUCT') NOT NULL DEFAULT 'FIXED_CART',
    ADD COLUMN `discountValue` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `allowFreeShipping` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `individualUse` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `excludeSaleItems` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `maximumSubtotalCents` INTEGER NULL,
    ADD COLUMN `maxEligibleItems` INTEGER NULL;

ALTER TABLE `CouponRedemption`
    ADD COLUMN `customerEmail` VARCHAR(191) NULL;

CREATE TABLE `CouponProductRule` (
    `couponId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `excluded` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`couponId`, `productId`),
    INDEX `CouponProductRule_productId_idx`(`productId`),
    CONSTRAINT `CouponProductRule_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `CouponProductRule_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CouponCategoryRule` (
    `couponId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `excluded` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`couponId`, `categoryId`),
    INDEX `CouponCategoryRule_categoryId_idx`(`categoryId`),
    CONSTRAINT `CouponCategoryRule_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `CouponCategoryRule_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CouponEmailRestriction` (
    `id` VARCHAR(191) NOT NULL,
    `couponId` VARCHAR(191) NOT NULL,
    `pattern` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CouponEmailRestriction_couponId_pattern_key`(`couponId`, `pattern`),
    INDEX `CouponEmailRestriction_couponId_idx`(`couponId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `CouponEmailRestriction_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `CouponRedemption_couponId_customerEmail_idx` ON `CouponRedemption`(`couponId`, `customerEmail`);
