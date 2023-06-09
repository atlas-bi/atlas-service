-- CreateTable
CREATE TABLE "_GroupToLabel" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToLabel_AB_unique" ON "_GroupToLabel"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToLabel_B_index" ON "_GroupToLabel"("B");

-- AddForeignKey
ALTER TABLE "_GroupToLabel" ADD CONSTRAINT "_GroupToLabel_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToLabel" ADD CONSTRAINT "_GroupToLabel_B_fkey" FOREIGN KEY ("B") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
