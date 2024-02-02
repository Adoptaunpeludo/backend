/*
  Warnings:

  - You are about to drop the column `address` on the `ContactInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContactInfo" DROP COLUMN "address",
ADD COLUMN     "citiesId" TEXT;

-- CreateTable
CREATE TABLE "Cities" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Cities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_citiesId_fkey" FOREIGN KEY ("citiesId") REFERENCES "Cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
