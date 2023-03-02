-- AlterTable
ALTER TABLE "RequestType" ADD COLUMN     "showCriteria" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showDescription" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showExportToExcel" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showParameters" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showPurpose" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showRecipients" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showRegulatory" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showRequester" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSchedule" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSupportsInitiative" BOOLEAN NOT NULL DEFAULT true;
