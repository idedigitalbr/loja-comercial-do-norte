-- CreateTable
CREATE TABLE "PostCategory" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "legacySource" VARCHAR(80),
    "legacyId" VARCHAR(191),
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(191) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "legacySource" VARCHAR(80),
    "legacyId" VARCHAR(191),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(191) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverUrl" VARCHAR(500),
    "videoUrl" VARCHAR(500),
    "videoDuration" VARCHAR(50),
    "authorName" VARCHAR(160),
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "categoryId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "legacySource" VARCHAR(80),
    "legacyId" VARCHAR(191),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(191) NOT NULL,
    "subtitle" VARCHAR(255),
    "description" TEXT NOT NULL,
    "posterUrl" VARCHAR(500),
    "eventDate" TIMESTAMP(3),
    "eventDateText" VARCHAR(100),
    "eventTime" VARCHAR(100),
    "location" VARCHAR(255),
    "locationAddress" VARCHAR(255),
    "instructor" VARCHAR(160),
    "badge" VARCHAR(80),
    "ctaLabel" VARCHAR(80),
    "ctaUrl" VARCHAR(500),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostCategory_publicId_key" ON "PostCategory"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PostCategory_name_key" ON "PostCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PostCategory_slug_key" ON "PostCategory"("slug");

-- CreateIndex
CREATE INDEX "PostCategory_status_sortOrder_idx" ON "PostCategory"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Post_publicId_key" ON "Post"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_publicId_key" ON "Event"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_sortOrder_idx" ON "Event"("status", "sortOrder");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PostCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
