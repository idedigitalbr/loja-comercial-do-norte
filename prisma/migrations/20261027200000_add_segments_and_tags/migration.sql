-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "legacySource" VARCHAR(80),
    "legacyId" VARCHAR(191),
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(191) NOT NULL,
    "description" TEXT,
    "imagePath" VARCHAR(500),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSegment" (
    "productId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,

    CONSTRAINT "ProductSegment_pkey" PRIMARY KEY ("productId","segmentId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "legacySource" VARCHAR(80),
    "legacyId" VARCHAR(191),
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(191) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTag" (
    "productId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("productId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Segment_publicId_key" ON "Segment"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_name_key" ON "Segment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_slug_key" ON "Segment"("slug");

-- CreateIndex
CREATE INDEX "Segment_status_sortOrder_idx" ON "Segment"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_legacySource_legacyId_key" ON "Segment"("legacySource", "legacyId");

-- CreateIndex
CREATE INDEX "ProductSegment_segmentId_idx" ON "ProductSegment"("segmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_publicId_key" ON "Tag"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_status_name_idx" ON "Tag"("status", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_legacySource_legacyId_key" ON "Tag"("legacySource", "legacyId");

-- CreateIndex
CREATE INDEX "ProductTag_tagId_idx" ON "ProductTag"("tagId");

-- AddForeignKey
ALTER TABLE "ProductSegment" ADD CONSTRAINT "ProductSegment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSegment" ADD CONSTRAINT "ProductSegment_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTag" ADD CONSTRAINT "ProductTag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTag" ADD CONSTRAINT "ProductTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
