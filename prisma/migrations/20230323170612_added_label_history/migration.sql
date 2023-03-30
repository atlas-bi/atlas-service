-- CreateTable
CREATE TABLE "RequestLabelHistory" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "labelId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added" BOOLEAN NOT NULL,

    CONSTRAINT "RequestLabelHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestLabelHistory" ADD CONSTRAINT "RequestLabelHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestLabelHistory" ADD CONSTRAINT "RequestLabelHistory_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestLabelHistory" ADD CONSTRAINT "RequestLabelHistory_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
