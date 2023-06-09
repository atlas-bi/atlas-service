-- CreateTable
CREATE TABLE "_RequestMentions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CommentMentions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RequestMentions_AB_unique" ON "_RequestMentions"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestMentions_B_index" ON "_RequestMentions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CommentMentions_AB_unique" ON "_CommentMentions"("A", "B");

-- CreateIndex
CREATE INDEX "_CommentMentions_B_index" ON "_CommentMentions"("B");

-- AddForeignKey
ALTER TABLE "_RequestMentions" ADD CONSTRAINT "_RequestMentions_A_fkey" FOREIGN KEY ("A") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestMentions" ADD CONSTRAINT "_RequestMentions_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentMentions" ADD CONSTRAINT "_CommentMentions_A_fkey" FOREIGN KEY ("A") REFERENCES "RequestComments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentMentions" ADD CONSTRAINT "_CommentMentions_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
