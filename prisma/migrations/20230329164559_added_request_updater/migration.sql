-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "updaterId" INTEGER;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
