-- How many future classes one client can hold at a time.
ALTER TABLE "instructor_profiles" ADD COLUMN "maxUpcomingBookings" INTEGER NOT NULL DEFAULT 8;
