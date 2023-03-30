/*
  Warnings:

  - You are about to drop the `_RequestSubsciber` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RequestSubsciber" DROP CONSTRAINT "_RequestSubsciber_A_fkey";

-- DropForeignKey
ALTER TABLE "_RequestSubsciber" DROP CONSTRAINT "_RequestSubsciber_B_fkey";

-- DropTable
DROP TABLE "_RequestSubsciber";

-- CreateTable
CREATE TABLE "RequestRecipientHistory" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added" BOOLEAN NOT NULL,

    CONSTRAINT "RequestRecipientHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestRecipientHistory" ADD CONSTRAINT "RequestRecipientHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRecipientHistory" ADD CONSTRAINT "RequestRecipientHistory_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRecipientHistory" ADD CONSTRAINT "RequestRecipientHistory_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
