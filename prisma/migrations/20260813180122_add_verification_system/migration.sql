-- AlterTable
ALTER TABLE "advisor_profiles" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationNotes" TEXT,
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "advisor_documents" (
    "id" TEXT NOT NULL,
    "advisorId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "aiAnalysis" TEXT,
    "aiScore" DOUBLE PRECISION,
    "aiStatus" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "manualStatus" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advisor_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "advisor_documents" ADD CONSTRAINT "advisor_documents_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "advisor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
