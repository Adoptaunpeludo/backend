/*
  Warnings:

  - You are about to drop the column `citiesId` on the `ContactInfo` table. All the data in the column will be lost.
  - Added the required column `cityID` to the `ContactInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContactInfo" DROP CONSTRAINT "ContactInfo_citiesId_fkey";

-- AlterTable
ALTER TABLE "ContactInfo" DROP COLUMN "citiesId",
ADD COLUMN     "cityID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_cityID_fkey" FOREIGN KEY ("cityID") REFERENCES "Cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
