-- CreateTable
CREATE TABLE "_RequestAssignees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RequestAssignees_AB_unique" ON "_RequestAssignees"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestAssignees_B_index" ON "_RequestAssignees"("B");

-- AddForeignKey
ALTER TABLE "_RequestAssignees" ADD CONSTRAINT "_RequestAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestAssignees" ADD CONSTRAINT "_RequestAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
