-- Studio cash tracking: mark completed / no-show sessions as paid and who paid.
ALTER TABLE "appointments" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "appointments" ADD COLUMN "paidByName" TEXT;
ALTER TABLE "appointments" ADD COLUMN "paidRecordedByEmail" TEXT;
