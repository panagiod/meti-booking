-- AlterTable
ALTER TABLE "advisor_profiles" ADD COLUMN     "mpMode" TEXT NOT NULL DEFAULT 'PRODUCTION';

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "isTest" BOOLEAN NOT NULL DEFAULT false;
