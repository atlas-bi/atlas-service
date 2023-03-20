-- CreateTable
CREATE TABLE "_RequestWatchers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RequestWatchers_AB_unique" ON "_RequestWatchers"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestWatchers_B_index" ON "_RequestWatchers"("B");

-- AddForeignKey
ALTER TABLE "_RequestWatchers" ADD CONSTRAINT "_RequestWatchers_A_fkey" FOREIGN KEY ("A") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestWatchers" ADD CONSTRAINT "_RequestWatchers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
