-- CreateTable
CREATE TABLE "studio_content" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_content_pkey" PRIMARY KEY ("id")
);
