-- CreateTable
CREATE TABLE "RequestComments" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updaterId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "comment" TEXT,

    CONSTRAINT "RequestComments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestComments" ADD CONSTRAINT "RequestComments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestComments" ADD CONSTRAINT "RequestComments_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestComments" ADD CONSTRAINT "RequestComments_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
