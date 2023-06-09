/*
  Warnings:

  - You are about to drop the column `showTextFieldTwp` on the `RequestType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RequestType" DROP COLUMN "showTextFieldTwp",
ADD COLUMN     "showTextFieldTwo" BOOLEAN NOT NULL DEFAULT true;
