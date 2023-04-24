-- AlterTable
ALTER TABLE "RequestType" ADD COLUMN     "requireTextFieldFive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireTextFieldFour" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireTextFieldOne" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireTextFieldThree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireTextFieldTwo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireUserFieldOne" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireUserFieldThree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireUserFieldTwo" BOOLEAN NOT NULL DEFAULT false;
