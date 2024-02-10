/*
  Warnings:

  - You are about to drop the column `toilletTrained` on the `Cat` table. All the data in the column will be lost.
  - Added the required column `toiletTrained` to the `Cat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cat" DROP COLUMN "toilletTrained",
ADD COLUMN     "toiletTrained" BOOLEAN NOT NULL;
