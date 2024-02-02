/*
  Warnings:

  - The primary key for the `Cities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Cities` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `citiesId` to the `ContactInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContactInfo" DROP CONSTRAINT "ContactInfo_citiesId_fkey";

-- AlterTable
ALTER TABLE "Cities" DROP CONSTRAINT "Cities_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Cities_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ContactInfo" DROP COLUMN "citiesId",
ADD COLUMN     "citiesId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_citiesId_fkey" FOREIGN KEY ("citiesId") REFERENCES "Cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
