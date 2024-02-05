/*
  Warnings:

  - You are about to drop the column `apellidos` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Shelter` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `Users` table. All the data in the column will be lost.
  - Added the required column `name` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `second_name` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Shelter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Adopter" DROP COLUMN "apellidos",
DROP COLUMN "nombre",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "second_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Shelter" DROP COLUMN "nombre",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "direccion",
DROP COLUMN "telefono",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone_number" TEXT;
