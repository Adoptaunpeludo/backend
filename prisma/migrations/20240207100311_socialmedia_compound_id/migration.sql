/*
  Warnings:

  - The primary key for the `SocialMedia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SocialMedia` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "SocialMedia_name_shelterId_idx";

-- AlterTable
ALTER TABLE "SocialMedia" DROP CONSTRAINT "SocialMedia_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("shelterId", "name");
