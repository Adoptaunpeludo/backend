/*
  Warnings:

  - The primary key for the `Adopter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dni` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Adopter` table. All the data in the column will be lost.
  - The primary key for the `Shelter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cif` on the `Shelter` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Shelter` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Shelter` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[UserID]` on the table `Adopter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[UserID]` on the table `Shelter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Apellidos` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DNI` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Nombre` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserID` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CIF` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Nombre` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UserID` to the `Shelter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_adopterId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_shelterId_fkey";

-- DropIndex
DROP INDEX "Adopter_dni_key";

-- DropIndex
DROP INDEX "Shelter_cif_key";

-- AlterTable
ALTER TABLE "Adopter" DROP CONSTRAINT "Adopter_pkey",
DROP COLUMN "dni",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "AdopterID" SERIAL NOT NULL,
ADD COLUMN     "Apellidos" TEXT NOT NULL,
ADD COLUMN     "DNI" TEXT NOT NULL,
ADD COLUMN     "Nombre" TEXT NOT NULL,
ADD COLUMN     "UserID" INTEGER NOT NULL,
ADD CONSTRAINT "Adopter_pkey" PRIMARY KEY ("AdopterID");

-- AlterTable
ALTER TABLE "Shelter" DROP CONSTRAINT "Shelter_pkey",
DROP COLUMN "cif",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "CIF" TEXT NOT NULL,
ADD COLUMN     "Nombre" TEXT NOT NULL,
ADD COLUMN     "ShelterID" SERIAL NOT NULL,
ADD COLUMN     "UserID" INTEGER NOT NULL,
ADD CONSTRAINT "Shelter_pkey" PRIMARY KEY ("ShelterID");

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Users" (
    "UserID" SERIAL NOT NULL,
    "Email" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Direccion" TEXT,
    "Telefono" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("UserID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Adopter_UserID_key" ON "Adopter"("UserID");

-- CreateIndex
CREATE UNIQUE INDEX "Shelter_UserID_key" ON "Shelter"("UserID");

-- AddForeignKey
ALTER TABLE "Adopter" ADD CONSTRAINT "Adopter_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shelter" ADD CONSTRAINT "Shelter_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;
