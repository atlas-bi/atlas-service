-- CreateTable
CREATE TABLE "JobLog" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "fail" INTEGER,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobLog_pkey" PRIMARY KEY ("id")
);
