/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'CANCEL';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone";
