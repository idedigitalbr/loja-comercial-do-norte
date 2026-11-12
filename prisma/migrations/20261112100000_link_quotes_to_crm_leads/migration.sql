-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "crmLeadId" TEXT;

-- CreateIndex
CREATE INDEX "Quote_crmLeadId_idx" ON "Quote"("crmLeadId");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_crmLeadId_fkey" FOREIGN KEY ("crmLeadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
