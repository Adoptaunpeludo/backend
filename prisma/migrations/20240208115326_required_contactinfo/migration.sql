/*
  Warnings:

  - Made the column `phoneNumber` on table `ContactInfo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `ContactInfo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cityId` on table `ContactInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ContactInfo" DROP CONSTRAINT "ContactInfo_cityId_fkey";

-- AlterTable
ALTER TABLE "ContactInfo" ALTER COLUMN "phoneNumber" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "cityId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
