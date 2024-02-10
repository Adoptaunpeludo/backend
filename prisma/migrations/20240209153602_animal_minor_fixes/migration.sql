/*
  Warnings:

  - The values [heavy] on the enum `energy` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `birthdate` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Animal` table. All the data in the column will be lost.
  - Added the required column `type` to the `Animal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "animal_type" AS ENUM ('cat', 'dog');

-- AlterEnum
BEGIN;
CREATE TYPE "energy_new" AS ENUM ('light', 'moderate', 'high');
ALTER TABLE "Animal" ALTER COLUMN "energyLevel" TYPE "energy_new" USING ("energyLevel"::text::"energy_new");
ALTER TYPE "energy" RENAME TO "energy_old";
ALTER TYPE "energy_new" RENAME TO "energy";
DROP TYPE "energy_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Animal" DROP CONSTRAINT "Animal_userId_fkey";

-- DropIndex
DROP INDEX "Animal_birthdate_idx";

-- AlterTable
ALTER TABLE "Animal" DROP COLUMN "birthdate",
DROP COLUMN "userId",
ADD COLUMN     "type" "animal_type" NOT NULL,
ALTER COLUMN "adoptedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_adoptedBy_fkey" FOREIGN KEY ("adoptedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
