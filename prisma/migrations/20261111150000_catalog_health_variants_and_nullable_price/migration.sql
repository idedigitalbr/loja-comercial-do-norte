-- CreateEnum
CREATE TYPE "CatalogAuditHealth" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "PricingMode" AS ENUM ('QUOTE_ONLY', 'FIXED_PRICE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "auditConfidence" INTEGER,
ADD COLUMN     "auditHealth" "CatalogAuditHealth" NOT NULL DEFAULT 'YELLOW',
ADD COLUMN     "auditIssueCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "auditIssues" JSONB,
ADD COLUMN     "brandMatchNote" VARCHAR(255),
ADD COLUMN     "rawCatalogName" VARCHAR(255),
ADD COLUMN     "rawDescription" TEXT,
ADD COLUMN     "sourcePdfPage" INTEGER,
ADD COLUMN     "sourcePrintedPage" INTEGER,
ADD COLUMN     "sourceRawText" TEXT,
ADD COLUMN     "sourceSection" VARCHAR(160);

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "heightPx" INTEGER,
ADD COLUMN     "imageConfidence" INTEGER,
ADD COLUMN     "imageSourceMethod" VARCHAR(60),
ADD COLUMN     "imageStatus" VARCHAR(60),
ADD COLUMN     "sha256" VARCHAR(64),
ADD COLUMN     "sourceOriginalPath" VARCHAR(255),
ADD COLUMN     "widthPx" INTEGER;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "auditHealth" "CatalogAuditHealth" NOT NULL DEFAULT 'YELLOW',
ADD COLUMN     "auditIssueCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "auditIssues" JSONB,
ADD COLUMN     "capacityOrVolume" VARCHAR(100),
ADD COLUMN     "color" VARCHAR(80),
ADD COLUMN     "diameterText" VARCHAR(80),
ADD COLUMN     "dimensionsRaw" VARCHAR(180),
ADD COLUMN     "externalDimensions" VARCHAR(100),
ADD COLUMN     "freightReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gtinRaw" VARCHAR(64),
ADD COLUMN     "gtinStatus" VARCHAR(40),
ADD COLUMN     "gtinValid" BOOLEAN,
ADD COLUMN     "heightText" VARCHAR(80),
ADD COLUMN     "individualVolumeText" VARCHAR(80),
ADD COLUMN     "internalDimensions" VARCHAR(100),
ADD COLUMN     "legacyId" VARCHAR(191),
ADD COLUMN     "legacySource" VARCHAR(80),
ADD COLUMN     "manufacturerRef" VARCHAR(100),
ADD COLUMN     "material" VARCHAR(120),
ADD COLUMN     "ncm" VARCHAR(20),
ADD COLUMN     "packagingFactor1" INTEGER,
ADD COLUMN     "packagingFactor2" INTEGER,
ADD COLUMN     "packagingRaw" VARCHAR(120),
ADD COLUMN     "packagingTotalUnits" INTEGER,
ADD COLUMN     "packagingType" VARCHAR(40),
ADD COLUMN     "packagingUnit" VARCHAR(40),
ADD COLUMN     "pricingMode" "PricingMode" NOT NULL DEFAULT 'QUOTE_ONLY',
ADD COLUMN     "reportedNetWeight" VARCHAR(80),
ADD COLUMN     "sizeOrModel" VARCHAR(100),
ADD COLUMN     "variantName" VARCHAR(220),
ALTER COLUMN "priceCents" DROP NOT NULL;

-- AlterTable
ALTER TABLE "QuoteItem" ALTER COLUMN "unitPriceCents" DROP NOT NULL,
ALTER COLUMN "totalCents" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Product_auditHealth_status_idx" ON "Product"("auditHealth", "status");

-- CreateIndex
CREATE INDEX "ProductVariant_gtinRaw_idx" ON "ProductVariant"("gtinRaw");

-- CreateIndex
CREATE INDEX "ProductVariant_auditHealth_status_idx" ON "ProductVariant"("auditHealth", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_legacySource_legacyId_key" ON "ProductVariant"("legacySource", "legacyId");
