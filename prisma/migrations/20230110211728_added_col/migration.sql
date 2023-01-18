/*
  Warnings:

  - Added the required column `creatorId` to the `RequestCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `RequestType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestCategory" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RequestType" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "RequestCategory" ADD CONSTRAINT "RequestCategory_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestType" ADD CONSTRAINT "RequestType_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
