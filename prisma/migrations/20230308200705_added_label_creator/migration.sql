/*
  Warnings:

  - Added the required column `creatorId` to the `Labels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Labels" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Labels" ADD CONSTRAINT "Labels_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
