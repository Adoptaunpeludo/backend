/*
  Warnings:

  - You are about to drop the column `adopted` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Adopter` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `easyTrain` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `energyLevel` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moltingAmount` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dni` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "legal_forms" AS ENUM ('association', 'public_utility_association', 'autonomous_foundation', 'national_foundation', 'other');

-- CreateEnum
CREATE TYPE "facilities" AS ENUM ('foster_homes', 'municipal_or_public_facilities', 'leased_facilities', 'owned_facilities', 'private_residences');

-- CreateEnum
CREATE TYPE "status_pet" AS ENUM ('adopted', 'fostered', 'reserved', 'awaiting_home');

-- CreateEnum
CREATE TYPE "molting" AS ENUM ('light', 'moderate', 'heavy', 'no_shedding');

-- CreateEnum
CREATE TYPE "energy" AS ENUM ('light', 'moderate', 'heavy');

-- CreateEnum
CREATE TYPE "potential" AS ENUM ('none', 'low', 'moderate', 'high', 'excessive');

-- DropForeignKey
ALTER TABLE "Adopter" DROP CONSTRAINT "Adopter_id_fkey";

-- DropForeignKey
ALTER TABLE "Animal" DROP CONSTRAINT "Animal_adoptedBy_fkey";

-- AlterTable
ALTER TABLE "Animal" DROP COLUMN "adopted",
ADD COLUMN     "easyTrain" BOOLEAN NOT NULL,
ADD COLUMN     "energyLevel" "energy" NOT NULL,
ADD COLUMN     "moltingAmount" "molting" NOT NULL,
ADD COLUMN     "status" "status_pet" NOT NULL DEFAULT 'awaiting_home';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "verified",
ADD COLUMN     "dni" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "Adopter";

-- CreateTable
CREATE TABLE "UserFav" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "animalId" TEXT,

    CONSTRAINT "UserFav_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dog" (
    "id" TEXT NOT NULL,
    "departmentAdapted" BOOLEAN NOT NULL,
    "droolingPotential" "potential" NOT NULL,
    "bark" "potential" NOT NULL,

    CONSTRAINT "Dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cat" (
    "id" TEXT NOT NULL,
    "playLevel" "potential" NOT NULL,
    "kidsFriendly" BOOLEAN NOT NULL,
    "toilletTrained" BOOLEAN NOT NULL,
    "scratchPotential" "potential" NOT NULL,

    CONSTRAINT "Cat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserFav" ADD CONSTRAINT "UserFav_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFav" ADD CONSTRAINT "UserFav_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_adoptedBy_fkey" FOREIGN KEY ("adoptedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dog" ADD CONSTRAINT "Dog_id_fkey" FOREIGN KEY ("id") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cat" ADD CONSTRAINT "Cat_id_fkey" FOREIGN KEY ("id") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
