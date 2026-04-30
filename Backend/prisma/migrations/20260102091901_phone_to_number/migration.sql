/*
  Warnings:

  - Changed the type of `phone` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3),
ADD COLUMN     "tempPassword" TEXT,
DROP COLUMN "phone",
ADD COLUMN     "phone" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "isActive" SET DEFAULT false;
