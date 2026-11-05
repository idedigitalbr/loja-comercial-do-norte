-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "CrmLead" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "customerName" VARCHAR(160) NOT NULL,
    "customerPhone" VARCHAR(40) NOT NULL,
    "customerEmail" VARCHAR(191),
    "preferredStore" VARCHAR(100) NOT NULL,
    "storeId" VARCHAR(50),
    "subject" VARCHAR(200) NOT NULL,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "origin" VARCHAR(40) NOT NULL DEFAULT 'chat-norti',
    "conversationLog" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmLeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorName" VARCHAR(120) NOT NULL DEFAULT 'Atendente',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmLeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrmLead_publicId_key" ON "CrmLead"("publicId");

-- CreateIndex
CREATE INDEX "CrmLead_stage_createdAt_idx" ON "CrmLead"("stage", "createdAt");

-- CreateIndex
CREATE INDEX "CrmLead_customerPhone_idx" ON "CrmLead"("customerPhone");

-- CreateIndex
CREATE INDEX "CrmLead_preferredStore_idx" ON "CrmLead"("preferredStore");

-- CreateIndex
CREATE INDEX "CrmLeadNote_leadId_createdAt_idx" ON "CrmLeadNote"("leadId", "createdAt");

-- AddForeignKey
ALTER TABLE "CrmLeadNote" ADD CONSTRAINT "CrmLeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
