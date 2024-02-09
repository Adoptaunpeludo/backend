/*
  Warnings:

  - You are about to drop the column `name` on the `Shelter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cif]` on the table `Shelter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dni]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cif` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facilities` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `legalForms` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownVet` to the `Shelter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `veterinaryFacilities` to the `Shelter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shelter" DROP COLUMN "name",
ADD COLUMN     "cif" TEXT NOT NULL,
ADD COLUMN     "facilities" "facilities" NOT NULL,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "legalForms" "legal_forms" NOT NULL,
ADD COLUMN     "ownVet" BOOLEAN NOT NULL,
ADD COLUMN     "veterinaryFacilities" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Shelter_cif_key" ON "Shelter"("cif");

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");
