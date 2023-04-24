-- CreateTable
CREATE TABLE "_RequestTypePurpose" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeCriteria" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeParameters" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeSchedule" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeRecipients" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeExportToExcel" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeRegulatory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeSupportsInitiative" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeDescription" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeRequester" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestTypeLabels" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypePurpose_AB_unique" ON "_RequestTypePurpose"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypePurpose_B_index" ON "_RequestTypePurpose"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeCriteria_AB_unique" ON "_RequestTypeCriteria"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeCriteria_B_index" ON "_RequestTypeCriteria"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeParameters_AB_unique" ON "_RequestTypeParameters"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeParameters_B_index" ON "_RequestTypeParameters"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeSchedule_AB_unique" ON "_RequestTypeSchedule"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeSchedule_B_index" ON "_RequestTypeSchedule"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeRecipients_AB_unique" ON "_RequestTypeRecipients"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeRecipients_B_index" ON "_RequestTypeRecipients"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeExportToExcel_AB_unique" ON "_RequestTypeExportToExcel"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeExportToExcel_B_index" ON "_RequestTypeExportToExcel"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeRegulatory_AB_unique" ON "_RequestTypeRegulatory"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeRegulatory_B_index" ON "_RequestTypeRegulatory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeSupportsInitiative_AB_unique" ON "_RequestTypeSupportsInitiative"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeSupportsInitiative_B_index" ON "_RequestTypeSupportsInitiative"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeDescription_AB_unique" ON "_RequestTypeDescription"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeDescription_B_index" ON "_RequestTypeDescription"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeRequester_AB_unique" ON "_RequestTypeRequester"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeRequester_B_index" ON "_RequestTypeRequester"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestTypeLabels_AB_unique" ON "_RequestTypeLabels"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestTypeLabels_B_index" ON "_RequestTypeLabels"("B");

-- AddForeignKey
ALTER TABLE "_RequestTypePurpose" ADD CONSTRAINT "_RequestTypePurpose_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypePurpose" ADD CONSTRAINT "_RequestTypePurpose_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeCriteria" ADD CONSTRAINT "_RequestTypeCriteria_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeCriteria" ADD CONSTRAINT "_RequestTypeCriteria_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeParameters" ADD CONSTRAINT "_RequestTypeParameters_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeParameters" ADD CONSTRAINT "_RequestTypeParameters_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeSchedule" ADD CONSTRAINT "_RequestTypeSchedule_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeSchedule" ADD CONSTRAINT "_RequestTypeSchedule_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeRecipients" ADD CONSTRAINT "_RequestTypeRecipients_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeRecipients" ADD CONSTRAINT "_RequestTypeRecipients_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeExportToExcel" ADD CONSTRAINT "_RequestTypeExportToExcel_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeExportToExcel" ADD CONSTRAINT "_RequestTypeExportToExcel_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeRegulatory" ADD CONSTRAINT "_RequestTypeRegulatory_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeRegulatory" ADD CONSTRAINT "_RequestTypeRegulatory_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeSupportsInitiative" ADD CONSTRAINT "_RequestTypeSupportsInitiative_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeSupportsInitiative" ADD CONSTRAINT "_RequestTypeSupportsInitiative_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeDescription" ADD CONSTRAINT "_RequestTypeDescription_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeDescription" ADD CONSTRAINT "_RequestTypeDescription_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeRequester" ADD CONSTRAINT "_RequestTypeRequester_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeRequester" ADD CONSTRAINT "_RequestTypeRequester_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeLabels" ADD CONSTRAINT "_RequestTypeLabels_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestTypeLabels" ADD CONSTRAINT "_RequestTypeLabels_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
