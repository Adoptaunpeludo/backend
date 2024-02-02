/*
  Warnings:

  - You are about to drop the column `dni` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `second_name` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `cif` on the `Shelter` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Users` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `Adopter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Adopter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Adopter" DROP COLUMN "dni",
DROP COLUMN "name",
DROP COLUMN "second_name",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'adopter';

-- AlterTable
ALTER TABLE "Shelter" DROP COLUMN "cif",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'shelter';

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "username";

-- CreateTable
CREATE TABLE "Admin" (
    "adminID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("adminID")
);

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "Users"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
