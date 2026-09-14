-- CreateTable
CREATE TABLE `SiteConfiguration` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `siteName` VARCHAR(160) NOT NULL DEFAULT 'Loja Jonas & Elivaldo',
    `logoPath` VARCHAR(500) NULL,
    `faviconPath` VARCHAR(500) NULL,
    `address` VARCHAR(255) NULL,
    `phone` VARCHAR(40) NULL,
    `whatsapp` VARCHAR(40) NULL,
    `instagramUrl` VARCHAR(500) NULL,
    `title` VARCHAR(180) NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteBanner` (
    `id` VARCHAR(191) NOT NULL,
    `desktopPath` VARCHAR(500) NOT NULL,
    `mobilePath` VARCHAR(500) NULL,
    `eyebrow` VARCHAR(120) NULL,
    `title` VARCHAR(220) NULL,
    `description` TEXT NULL,
    `ctaLabel` VARCHAR(120) NULL,
    `ctaHref` VARCHAR(500) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SiteBanner_status_sortOrder_idx`(`status`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentConfiguration` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `environment` ENUM('TEST', 'PRODUCTION') NOT NULL DEFAULT 'TEST',
    `accessTokenEncrypted` TEXT NULL,
    `publicKey` VARCHAR(255) NULL,
    `webhookSecretEncrypted` TEXT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `enablePix` BOOLEAN NOT NULL DEFAULT true,
    `enableCard` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SmtpConfiguration` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `host` VARCHAR(255) NULL,
    `port` INTEGER NOT NULL DEFAULT 587,
    `username` VARCHAR(255) NULL,
    `passwordEncrypted` TEXT NULL,
    `security` ENUM('NONE', 'STARTTLS', 'SSL_TLS') NOT NULL DEFAULT 'STARTTLS',
    `fromEmail` VARCHAR(191) NULL,
    `fromName` VARCHAR(160) NULL,
    `replyTo` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `key` ENUM('ACCOUNT_CREATED', 'ORDER_CREATED', 'PAYMENT_PENDING', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'ORDER_STATUS_CHANGED', 'PASSWORD_RESET') NOT NULL,
    `locale` VARCHAR(10) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `htmlBody` TEXT NOT NULL,
    `textBody` TEXT NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EmailTemplate_key_enabled_idx`(`key`, `enabled`),
    UNIQUE INDEX `EmailTemplate_key_locale_key`(`key`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationPreference` (
    `id` VARCHAR(191) NOT NULL,
    `eventKey` ENUM('ACCOUNT_CREATED', 'ORDER_CREATED', 'PAYMENT_PENDING', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'ORDER_STATUS_CHANGED', 'PASSWORD_RESET') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `recipientOverride` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationPreference_eventKey_key`(`eventKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailDelivery` (
    `id` VARCHAR(191) NOT NULL,
    `dedupeKey` VARCHAR(255) NOT NULL,
    `eventKey` ENUM('ACCOUNT_CREATED', 'ORDER_CREATED', 'PAYMENT_PENDING', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'ORDER_STATUS_CHANGED', 'PASSWORD_RESET') NOT NULL,
    `locale` VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    `recipient` VARCHAR(191) NOT NULL,
    `payloadJson` JSON NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'SENT', 'RETRY', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL DEFAULT 5,
    `lastError` TEXT NULL,
    `nextAttemptAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmailDelivery_dedupeKey_key`(`dedupeKey`),
    INDEX `EmailDelivery_status_nextAttemptAt_idx`(`status`, `nextAttemptAt`),
    INDEX `EmailDelivery_eventKey_createdAt_idx`(`eventKey`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
