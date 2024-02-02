/*
  Warnings:

  - The primary key for the `Cities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Cities` table. All the data in the column will be lost.
  - You are about to drop the column `cityID` on the `ContactInfo` table. All the data in the column will be lost.
  - Added the required column `city_name` to the `ContactInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ContactInfo" DROP CONSTRAINT "ContactInfo_cityID_fkey";

-- AlterTable
ALTER TABLE "Cities" DROP CONSTRAINT "Cities_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Cities_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "ContactInfo" DROP COLUMN "cityID",
ADD COLUMN     "city_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_city_name_fkey" FOREIGN KEY ("city_name") REFERENCES "Cities"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
