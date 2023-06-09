/*
  Warnings:

  - You are about to drop the column `showCriteria` on the `RequestType` table. All the data in the column will be lost.
  - You are about to drop the column `showDescription` on the `RequestType` table. All the data in the column will be lost.
  - You are about to drop the column `showExportToExcel` on the `RequestType` table. All the data in the column will be lost.
  - You are about to drop the column `showParameters` on the `RequestType` table. All the data in the column will be lost.
  - You are about to drop the column `showPurpose` on the `RequestType` table. All the data in the column will be lost.
  - You are about to drop the column `showRecipients` on the `RequestType` table. All the data in the column will be lost.
  - You are about to drop the column `showRegulatory` on the `RequestType` table. All the data in the column will be lost.
  - You are about to drop the column `showSchedule` on the `RequestType` table. All the data in the column will be lost.
  - You are about to drop the column `showSupportsInitiative` on the `RequestType` table. All the data in the column will be lost.
  - You are about to drop the `_RequestTypeCriteria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestTypeDescription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestTypeExportToExcel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestTypeParameters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestTypePurpose` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestTypeRecipients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestTypeRegulatory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestTypeSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RequestTypeSupportsInitiative` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RequestTypeCriteria" DROP CONSTRAINT "_RequestTypeCriteria_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeCriteria" DROP CONSTRAINT "_RequestTypeCriteria_B_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeDescription" DROP CONSTRAINT "_RequestTypeDescription_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeDescription" DROP CONSTRAINT "_RequestTypeDescription_B_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeExportToExcel" DROP CONSTRAINT "_RequestTypeExportToExcel_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeExportToExcel" DROP CONSTRAINT "_RequestTypeExportToExcel_B_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeParameters" DROP CONSTRAINT "_RequestTypeParameters_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeParameters" DROP CONSTRAINT "_RequestTypeParameters_B_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypePurpose" DROP CONSTRAINT "_RequestTypePurpose_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypePurpose" DROP CONSTRAINT "_RequestTypePurpose_B_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeRecipients" DROP CONSTRAINT "_RequestTypeRecipients_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeRecipients" DROP CONSTRAINT "_RequestTypeRecipients_B_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeRegulatory" DROP CONSTRAINT "_RequestTypeRegulatory_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeRegulatory" DROP CONSTRAINT "_RequestTypeRegulatory_B_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeSchedule" DROP CONSTRAINT "_RequestTypeSchedule_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeSchedule" DROP CONSTRAINT "_RequestTypeSchedule_B_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeSupportsInitiative" DROP CONSTRAINT "_RequestTypeSupportsInitiative_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestTypeSupportsInitiative" DROP CONSTRAINT "_RequestTypeSupportsInitiative_B_fkey";

-- AlterTable
ALTER TABLE "RequestType" DROP COLUMN "showCriteria",
DROP COLUMN "showDescription",
DROP COLUMN "showExportToExcel",
DROP COLUMN "showParameters",
DROP COLUMN "showPurpose",
DROP COLUMN "showRecipients",
DROP COLUMN "showRegulatory",
DROP COLUMN "showSchedule",
DROP COLUMN "showSupportsInitiative",
ADD COLUMN     "booleanFieldOneTitle" TEXT NOT NULL DEFAULT 'Export To Excel',
ADD COLUMN     "booleanFieldThreeTitle" TEXT NOT NULL DEFAULT 'Supports Initiative',
ADD COLUMN     "booleanFieldTwoTitle" TEXT NOT NULL DEFAULT 'Regulatory',
ADD COLUMN     "labelsTitle" TEXT NOT NULL DEFAULT 'Labels',
ADD COLUMN     "requesterTitle" TEXT NOT NULL DEFAULT 'Requester',
ADD COLUMN     "showBooleanFieldOne" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showBooleanFieldThree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showBooleanFieldTwo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTextFieldFive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTextFieldFour" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTextFieldOne" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTextFieldThree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTextFieldTwp" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showUserFieldOne" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showUserFieldThree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showUserFieldTwo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "textFieldFiveTitle" TEXT NOT NULL DEFAULT 'Schedule',
ADD COLUMN     "textFieldFourTitle" TEXT NOT NULL DEFAULT 'Parameters',
ADD COLUMN     "textFieldOneTitle" TEXT NOT NULL DEFAULT 'Description',
ADD COLUMN     "textFieldThreeTitle" TEXT NOT NULL DEFAULT 'Criteria',
ADD COLUMN     "textFieldTwoTitle" TEXT NOT NULL DEFAULT 'Purpose',
ADD COLUMN     "userFieldOneTitle" TEXT NOT NULL DEFAULT 'Recipients',
ADD COLUMN     "userFieldThreeTitle" TEXT NOT NULL DEFAULT 'Committee',
ADD COLUMN     "userFieldTwoTitle" TEXT NOT NULL DEFAULT 'Members';

-- DropTable
DROP TABLE "_RequestTypeCriteria";

-- DropTable
DROP TABLE "_RequestTypeDescription";

-- DropTable
DROP TABLE "_RequestTypeExportToExcel";

-- DropTable
DROP TABLE "_RequestTypeParameters";

-- DropTable
DROP TABLE "_RequestTypePurpose";

-- DropTable
DROP TABLE "_RequestTypeRecipients";

-- DropTable
DROP TABLE "_RequestTypeRegulatory";

-- DropTable
DROP TABLE "_RequestTypeSchedule";

-- DropTable
DROP TABLE "_RequestTypeSupportsInitiative";

-- CreateTable
CREATE TABLE "_RequestTypeTextFieldOne" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeTextFieldTwo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeTextFieldThree" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeTextFieldFour" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeTextFieldFive" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeBooleanFieldOne" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeBooleanFieldTwo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeBooleanFieldThree" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeUserFieldOne" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeUserFieldTwo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeUserFieldThree" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeTextFieldOne_AB_unique" ON "_RequestTypeTextFieldOne"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeTextFieldOne_B_index" ON "_RequestTypeTextFieldOne"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeTextFieldTwo_AB_unique" ON "_RequestTypeTextFieldTwo"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeTextFieldTwo_B_index" ON "_RequestTypeTextFieldTwo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeTextFieldThree_AB_unique" ON "_RequestTypeTextFieldThree"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeTextFieldThree_B_index" ON "_RequestTypeTextFieldThree"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeTextFieldFour_AB_unique" ON "_RequestTypeTextFieldFour"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeTextFieldFour_B_index" ON "_RequestTypeTextFieldFour"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeTextFieldFive_AB_unique" ON "_RequestTypeTextFieldFive"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeTextFieldFive_B_index" ON "_RequestTypeTextFieldFive"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeBooleanFieldOne_AB_unique" ON "_RequestTypeBooleanFieldOne"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeBooleanFieldOne_B_index" ON "_RequestTypeBooleanFieldOne"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeBooleanFieldTwo_AB_unique" ON "_RequestTypeBooleanFieldTwo"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeBooleanFieldTwo_B_index" ON "_RequestTypeBooleanFieldTwo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeBooleanFieldThree_AB_unique" ON "_RequestTypeBooleanFieldThree"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeBooleanFieldThree_B_index" ON "_RequestTypeBooleanFieldThree"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeUserFieldOne_AB_unique" ON "_RequestTypeUserFieldOne"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeUserFieldOne_B_index" ON "_RequestTypeUserFieldOne"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeUserFieldTwo_AB_unique" ON "_RequestTypeUserFieldTwo"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeUserFieldTwo_B_index" ON "_RequestTypeUserFieldTwo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeUserFieldThree_AB_unique" ON "_RequestTypeUserFieldThree"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeUserFieldThree_B_index" ON "_RequestTypeUserFieldThree"("B");

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldOne" ADD CONSTRAINT "_RequestTypeTextFieldOne_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldOne" ADD CONSTRAINT "_RequestTypeTextFieldOne_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldTwo" ADD CONSTRAINT "_RequestTypeTextFieldTwo_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldTwo" ADD CONSTRAINT "_RequestTypeTextFieldTwo_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldThree" ADD CONSTRAINT "_RequestTypeTextFieldThree_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldThree" ADD CONSTRAINT "_RequestTypeTextFieldThree_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldFour" ADD CONSTRAINT "_RequestTypeTextFieldFour_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldFour" ADD CONSTRAINT "_RequestTypeTextFieldFour_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldFive" ADD CONSTRAINT "_RequestTypeTextFieldFive_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeTextFieldFive" ADD CONSTRAINT "_RequestTypeTextFieldFive_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeBooleanFieldOne" ADD CONSTRAINT "_RequestTypeBooleanFieldOne_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeBooleanFieldOne" ADD CONSTRAINT "_RequestTypeBooleanFieldOne_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeBooleanFieldTwo" ADD CONSTRAINT "_RequestTypeBooleanFieldTwo_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeBooleanFieldTwo" ADD CONSTRAINT "_RequestTypeBooleanFieldTwo_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeBooleanFieldThree" ADD CONSTRAINT "_RequestTypeBooleanFieldThree_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeBooleanFieldThree" ADD CONSTRAINT "_RequestTypeBooleanFieldThree_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeUserFieldOne" ADD CONSTRAINT "_RequestTypeUserFieldOne_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeUserFieldOne" ADD CONSTRAINT "_RequestTypeUserFieldOne_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeUserFieldTwo" ADD CONSTRAINT "_RequestTypeUserFieldTwo_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeUserFieldTwo" ADD CONSTRAINT "_RequestTypeUserFieldTwo_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeUserFieldThree" ADD CONSTRAINT "_RequestTypeUserFieldThree_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeUserFieldThree" ADD CONSTRAINT "_RequestTypeUserFieldThree_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
