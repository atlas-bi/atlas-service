/*
  Warnings:

  - Made the column `name` on table `Label` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Label" ADD COLUMN     "color" TEXT,
ADD COLUMN     "description" TEXT,
ALTER COLUMN "name" SET NOT NULL;
