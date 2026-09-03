-- Rename leftover marketplace advisor identifiers to instructor.

ALTER TABLE "advisor_profiles" RENAME TO "instructor_profiles";
ALTER TABLE "advisor_services" RENAME TO "instructor_services";
ALTER TABLE "advisor_schedules" RENAME TO "instructor_schedules";
ALTER TABLE "advisor_documents" RENAME TO "instructor_documents";
ALTER TABLE "advisor_categories" RENAME TO "instructor_categories";

ALTER TABLE "instructor_services" RENAME COLUMN "advisorId" TO "instructorId";
ALTER TABLE "instructor_schedules" RENAME COLUMN "advisorId" TO "instructorId";
ALTER TABLE "instructor_documents" RENAME COLUMN "advisorId" TO "instructorId";
ALTER TABLE "instructor_categories" RENAME COLUMN "advisorId" TO "instructorId";
ALTER TABLE "appointments" RENAME COLUMN "advisorId" TO "instructorId";
ALTER TABLE "appointments" RENAME COLUMN "advisorEarning" TO "instructorEarning";
ALTER TABLE "promotions" RENAME COLUMN "advisorId" TO "instructorId";
ALTER TABLE "invoices" RENAME COLUMN "advisorId" TO "instructorId";
ALTER TABLE "blocked_times" RENAME COLUMN "advisorId" TO "instructorId";

ALTER INDEX "advisor_profiles_userId_key" RENAME TO "instructor_profiles_userId_key";
ALTER INDEX "advisor_schedules_advisorId_dayOfWeek_key" RENAME TO "instructor_schedules_instructorId_dayOfWeek_key";
ALTER INDEX "advisor_categories_advisorId_categoryId_key" RENAME TO "instructor_categories_instructorId_categoryId_key";
ALTER INDEX "invoices_advisorId_periodStart_periodEnd_key" RENAME TO "invoices_instructorId_periodStart_periodEnd_key";
ALTER INDEX "blocked_times_advisorId_startDate_endDate_idx" RENAME TO "blocked_times_instructorId_startDate_endDate_idx";

ALTER TABLE "instructor_profiles" RENAME CONSTRAINT "advisor_profiles_pkey" TO "instructor_profiles_pkey";
ALTER TABLE "instructor_profiles" RENAME CONSTRAINT "advisor_profiles_userId_fkey" TO "instructor_profiles_userId_fkey";
ALTER TABLE "instructor_services" RENAME CONSTRAINT "advisor_services_pkey" TO "instructor_services_pkey";
ALTER TABLE "instructor_services" RENAME CONSTRAINT "advisor_services_advisorId_fkey" TO "instructor_services_instructorId_fkey";
ALTER TABLE "instructor_services" RENAME CONSTRAINT "advisor_services_categoryId_fkey" TO "instructor_services_categoryId_fkey";
ALTER TABLE "instructor_schedules" RENAME CONSTRAINT "advisor_schedules_pkey" TO "instructor_schedules_pkey";
ALTER TABLE "instructor_schedules" RENAME CONSTRAINT "advisor_schedules_advisorId_fkey" TO "instructor_schedules_instructorId_fkey";
ALTER TABLE "instructor_documents" RENAME CONSTRAINT "advisor_documents_pkey" TO "instructor_documents_pkey";
ALTER TABLE "instructor_documents" RENAME CONSTRAINT "advisor_documents_advisorId_fkey" TO "instructor_documents_instructorId_fkey";
ALTER TABLE "instructor_categories" RENAME CONSTRAINT "advisor_categories_pkey" TO "instructor_categories_pkey";
ALTER TABLE "instructor_categories" RENAME CONSTRAINT "advisor_categories_advisorId_fkey" TO "instructor_categories_instructorId_fkey";
ALTER TABLE "instructor_categories" RENAME CONSTRAINT "advisor_categories_categoryId_fkey" TO "instructor_categories_categoryId_fkey";
ALTER TABLE "promotions" RENAME CONSTRAINT "promotions_advisorId_fkey" TO "promotions_instructorId_fkey";
ALTER TABLE "appointments" RENAME CONSTRAINT "appointments_advisorId_fkey" TO "appointments_instructorId_fkey";
ALTER TABLE "invoices" RENAME CONSTRAINT "invoices_advisorId_fkey" TO "invoices_instructorId_fkey";
ALTER TABLE "blocked_times" RENAME CONSTRAINT "blocked_times_advisorId_fkey" TO "blocked_times_instructorId_fkey";

ALTER TYPE "UserRole" RENAME VALUE 'ADVISOR' TO 'INSTRUCTOR';
