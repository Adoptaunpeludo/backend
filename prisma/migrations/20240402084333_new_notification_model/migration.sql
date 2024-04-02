/*
  Warnings:

  - You are about to drop the column `animalSlug` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `animalType` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `data` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "animalSlug",
DROP COLUMN "animalType",
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
