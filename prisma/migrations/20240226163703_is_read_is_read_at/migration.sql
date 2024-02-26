/*
  Warnings:

  - You are about to drop the column `readed` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `readedAt` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "readed",
DROP COLUMN "readedAt",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isReaddAt" TIMESTAMP(3);
