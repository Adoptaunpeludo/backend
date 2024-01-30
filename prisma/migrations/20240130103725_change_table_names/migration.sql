/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Adopter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shelter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_adminID_fkey";

-- DropForeignKey
ALTER TABLE "Adopter" DROP CONSTRAINT "Adopter_adopterID_fkey";

-- DropForeignKey
ALTER TABLE "Shelter" DROP CONSTRAINT "Shelter_shelterID_fkey";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Adopter";

-- DropTable
DROP TABLE "Shelter";

-- CreateTable
CREATE TABLE "Adopters" (
    "adopterID" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'adopter',

    CONSTRAINT "Adopters_pkey" PRIMARY KEY ("adopterID")
);

-- CreateTable
CREATE TABLE "Shelters" (
    "shelterID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'shelter',

    CONSTRAINT "Shelters_pkey" PRIMARY KEY ("shelterID")
);

-- CreateTable
CREATE TABLE "Admins" (
    "adminID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("adminID")
);

-- AddForeignKey
ALTER TABLE "Adopters" ADD CONSTRAINT "Adopters_adopterID_fkey" FOREIGN KEY ("adopterID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shelters" ADD CONSTRAINT "Shelters_shelterID_fkey" FOREIGN KEY ("shelterID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admins" ADD CONSTRAINT "Admins_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
