/*
  Warnings:

  - Added the required column `verificationToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verified` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationToken" TEXT NOT NULL,
ADD COLUMN     "verified" TIMESTAMP(3) NOT NULL;
