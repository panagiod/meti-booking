-- AlterTable
ALTER TABLE "advisor_services" ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "advisor_services" ADD CONSTRAINT "advisor_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
