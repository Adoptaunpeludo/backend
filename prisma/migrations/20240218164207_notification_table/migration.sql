/*
  Warnings:

  - Added the required column `readed` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "readed" BOOLEAN NOT NULL,
ADD COLUMN     "readedAt" TIMESTAMP(3) NOT NULL;
