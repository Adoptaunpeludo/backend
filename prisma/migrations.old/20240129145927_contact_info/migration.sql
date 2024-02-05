/*
  Warnings:

  - You are about to drop the column `userID` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `Shelter` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Adopter_userID_key";

-- DropIndex
DROP INDEX "Shelter_userID_key";

-- AlterTable
ALTER TABLE "Adopter" DROP COLUMN "userID";

-- AlterTable
ALTER TABLE "Shelter" DROP COLUMN "userID";
