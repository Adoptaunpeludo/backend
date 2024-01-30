/*
  Warnings:

  - The primary key for the `Adopter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Shelter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `Users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Adopter" DROP CONSTRAINT "Adopter_userID_fkey";

-- DropForeignKey
ALTER TABLE "Shelter" DROP CONSTRAINT "Shelter_userID_fkey";

-- AlterTable
ALTER TABLE "Adopter" DROP CONSTRAINT "Adopter_pkey",
ALTER COLUMN "adopterID" DROP DEFAULT,
ALTER COLUMN "adopterID" SET DATA TYPE TEXT,
ADD CONSTRAINT "Adopter_pkey" PRIMARY KEY ("adopterID");
DROP SEQUENCE "Adopter_adopterID_seq";

-- AlterTable
ALTER TABLE "Shelter" DROP CONSTRAINT "Shelter_pkey",
ALTER COLUMN "shelterID" DROP DEFAULT,
ALTER COLUMN "shelterID" SET DATA TYPE TEXT,
ADD CONSTRAINT "Shelter_pkey" PRIMARY KEY ("shelterID");
DROP SEQUENCE "Shelter_shelterID_seq";

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "address",
DROP COLUMN "phone_number",
ALTER COLUMN "userID" DROP DEFAULT,
ALTER COLUMN "userID" SET DATA TYPE TEXT,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("userID");
DROP SEQUENCE "Users_userID_seq";

-- CreateTable
CREATE TABLE "ContactInfo" (
    "userID" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("userID")
);

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adopter" ADD CONSTRAINT "Adopter_adopterID_fkey" FOREIGN KEY ("adopterID") REFERENCES "Users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shelter" ADD CONSTRAINT "Shelter_shelterID_fkey" FOREIGN KEY ("shelterID") REFERENCES "Users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
