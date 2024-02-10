/*
  Warnings:

  - Changed the type of `gender` on the `Animal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "gender_enum" AS ENUM ('male', 'female');

-- AlterTable
ALTER TABLE "Animal" DROP COLUMN "gender",
ADD COLUMN     "gender" "gender_enum" NOT NULL;

-- DropEnum
DROP TYPE "genter_enum";

-- CreateIndex
CREATE INDEX "Animal_gender_idx" ON "Animal"("gender");
