/*
  Warnings:

  - The primary key for the `Adopter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `AdopterID` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `Apellidos` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `DNI` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `Nombre` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `Adopter` table. All the data in the column will be lost.
  - The primary key for the `Shelter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CIF` on the `Shelter` table. All the data in the column will be lost.
  - You are about to drop the column `Nombre` on the `Shelter` table. All the data in the column will be lost.
  - You are about to drop the column `ShelterID` on the `Shelter` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `Shelter` table. All the data in the column will be lost.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Direccion` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `Email` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `Password` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `Telefono` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `Username` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userID]` on the table `Adopter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userID]` on the table `Shelter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellidos` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dni` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cif` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Adopter" DROP CONSTRAINT "Adopter_UserID_fkey";

-- DropForeignKey
ALTER TABLE "Shelter" DROP CONSTRAINT "Shelter_UserID_fkey";

-- DropIndex
DROP INDEX "Adopter_UserID_key";

-- DropIndex
DROP INDEX "Shelter_UserID_key";

-- DropIndex
DROP INDEX "Users_Email_key";

-- AlterTable
ALTER TABLE "Adopter" DROP CONSTRAINT "Adopter_pkey",
DROP COLUMN "AdopterID",
DROP COLUMN "Apellidos",
DROP COLUMN "DNI",
DROP COLUMN "Nombre",
DROP COLUMN "UserID",
ADD COLUMN     "adopterID" SERIAL NOT NULL,
ADD COLUMN     "apellidos" TEXT NOT NULL,
ADD COLUMN     "dni" TEXT NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "userID" INTEGER NOT NULL,
ADD CONSTRAINT "Adopter_pkey" PRIMARY KEY ("adopterID");

-- AlterTable
ALTER TABLE "Shelter" DROP CONSTRAINT "Shelter_pkey",
DROP COLUMN "CIF",
DROP COLUMN "Nombre",
DROP COLUMN "ShelterID",
DROP COLUMN "UserID",
ADD COLUMN     "cif" TEXT NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "shelterID" SERIAL NOT NULL,
ADD COLUMN     "userID" INTEGER NOT NULL,
ADD CONSTRAINT "Shelter_pkey" PRIMARY KEY ("shelterID");

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "Direccion",
DROP COLUMN "Email",
DROP COLUMN "Password",
DROP COLUMN "Telefono",
DROP COLUMN "UserID",
DROP COLUMN "Username",
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "telefono" TEXT,
ADD COLUMN     "userID" SERIAL NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Adopter_userID_key" ON "Adopter"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Shelter_userID_key" ON "Shelter"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Adopter" ADD CONSTRAINT "Adopter_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shelter" ADD CONSTRAINT "Shelter_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
