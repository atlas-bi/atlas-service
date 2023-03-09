/*
  Warnings:

  - You are about to drop the column `showTags` on the `RequestType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RequestType" DROP COLUMN "showTags",
ADD COLUMN     "showLabels" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Labels" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LabelsToRequest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LabelsToRequest_AB_unique" ON "_LabelsToRequest"("A", "B");

-- CreateIndex
CREATE INDEX "_LabelsToRequest_B_index" ON "_LabelsToRequest"("B");

-- AddForeignKey
ALTER TABLE "_LabelsToRequest" ADD CONSTRAINT "_LabelsToRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "Labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelsToRequest" ADD CONSTRAINT "_LabelsToRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
