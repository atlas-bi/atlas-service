/*
  Warnings:

  - You are about to drop the `Labels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LabelsToRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Labels" DROP CONSTRAINT "Labels_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "_LabelsToRequest" DROP CONSTRAINT "_LabelsToRequest_A_fkey";

-- DropForeignKey
ALTER TABLE "_LabelsToRequest" DROP CONSTRAINT "_LabelsToRequest_B_fkey";

-- DropTable
DROP TABLE "Labels";

-- DropTable
DROP TABLE "_LabelsToRequest";

-- CreateTable
CREATE TABLE "Label" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LabelToRequest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LabelToRequest_AB_unique" ON "_LabelToRequest"("A", "B");

-- CreateIndex
CREATE INDEX "_LabelToRequest_B_index" ON "_LabelToRequest"("B");

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToRequest" ADD CONSTRAINT "_LabelToRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LabelToRequest" ADD CONSTRAINT "_LabelToRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
