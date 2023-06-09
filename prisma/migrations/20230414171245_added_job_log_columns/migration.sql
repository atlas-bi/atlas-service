-- AlterTable
ALTER TABLE "JobLog" ADD COLUMN     "completed" TIMESTAMP(3),
ADD COLUMN     "started" TIMESTAMP(3),
ADD COLUMN     "status" TEXT;
