/*
  Warnings:

  - You are about to drop the column `recipients` on the `Request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "recipients";

-- CreateTable
CREATE TABLE "_RequestSubsciber" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ReportRecipient" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RequestSubsciber_AB_unique" ON "_RequestSubsciber"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestSubsciber_B_index" ON "_RequestSubsciber"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ReportRecipient_AB_unique" ON "_ReportRecipient"("A", "B");

-- CreateIndex
CREATE INDEX "_ReportRecipient_B_index" ON "_ReportRecipient"("B");

-- AddForeignKey
ALTER TABLE "_RequestSubsciber" ADD CONSTRAINT "_RequestSubsciber_A_fkey" FOREIGN KEY ("A") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestSubsciber" ADD CONSTRAINT "_RequestSubsciber_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportRecipient" ADD CONSTRAINT "_ReportRecipient_A_fkey" FOREIGN KEY ("A") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportRecipient" ADD CONSTRAINT "_ReportRecipient_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
