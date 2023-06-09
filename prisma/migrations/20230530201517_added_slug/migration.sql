/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "slug" TEXT;

UPDATE "User"
SET slug = replace(LOWER(split_part(email, '@', 1)),'.','-');

-- make not null
ALTER TABLE "User" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
