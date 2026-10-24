-- AlterTable
ALTER TABLE "Category" ADD COLUMN "parentId" TEXT,
ADD COLUMN "imagePath" VARCHAR(500),
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Category_parentId_status_idx" ON "Category"("parentId", "status");

-- CreateIndex
CREATE INDEX "Category_status_sortOrder_idx" ON "Category"("status", "sortOrder");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
