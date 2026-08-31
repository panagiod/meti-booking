-- Align Prisma default with siteConfig.defaultBookingLeadHours (2 hours for MeTi studio)
ALTER TABLE "advisor_profiles" ALTER COLUMN "bookingLeadHours" SET DEFAULT 2;
