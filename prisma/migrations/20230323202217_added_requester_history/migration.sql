-- CreateTable
CREATE TABLE "RequestRequesterHistory" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added" BOOLEAN NOT NULL,

    CONSTRAINT "RequestRequesterHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestRequesterHistory" ADD CONSTRAINT "RequestRequesterHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRequesterHistory" ADD CONSTRAINT "RequestRequesterHistory_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestRequesterHistory" ADD CONSTRAINT "RequestRequesterHistory_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
