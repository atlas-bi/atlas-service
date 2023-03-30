-- CreateTable
CREATE TABLE "RequestAssigneeHistory" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added" BOOLEAN NOT NULL,

    CONSTRAINT "RequestAssigneeHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestAssigneeHistory" ADD CONSTRAINT "RequestAssigneeHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestAssigneeHistory" ADD CONSTRAINT "RequestAssigneeHistory_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestAssigneeHistory" ADD CONSTRAINT "RequestAssigneeHistory_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
