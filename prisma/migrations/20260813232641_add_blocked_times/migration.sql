-- CreateTable
CREATE TABLE "blocked_times" (
    "id" TEXT NOT NULL,
    "advisorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isAllDay" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocked_times_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blocked_times_advisorId_startDate_endDate_idx" ON "blocked_times"("advisorId", "startDate", "endDate");

-- AddForeignKey
ALTER TABLE "blocked_times" ADD CONSTRAINT "blocked_times_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "advisor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
