-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "managerId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inviteExpiry" TIMESTAMP(3),
ADD COLUMN     "inviteToken" TEXT;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
