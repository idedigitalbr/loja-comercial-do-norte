CREATE TABLE `CouponBrandRule` (
    `couponId` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `excluded` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`couponId`, `brandId`),
    INDEX `CouponBrandRule_brandId_idx`(`brandId`),
    CONSTRAINT `CouponBrandRule_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `CouponBrandRule_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
