-- Slim date log for admin year metrics. Full booking rows stay visible as last 8.

CREATE TABLE "client_attendance" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "studioDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_attendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "client_attendance_appointmentId_key" ON "client_attendance"("appointmentId");

CREATE INDEX "client_attendance_clientId_studioDate_idx" ON "client_attendance"("clientId", "studioDate");

ALTER TABLE "client_attendance" ADD CONSTRAINT "client_attendance_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
