-- How many new bookings one client can make in 24 hours.
ALTER TABLE "instructor_profiles" ADD COLUMN "dailyBookingLimit" INTEGER NOT NULL DEFAULT 8;
