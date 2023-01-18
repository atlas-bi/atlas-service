/*
  Warnings:

  - You are about to drop the `RequestCategories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestTypes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_typeId_fkey";

-- DropTable
DROP TABLE "RequestCategories";

-- DropTable
DROP TABLE "RequestTypes";

-- CreateTable
CREATE TABLE "RequestCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RequestCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "RequestType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
