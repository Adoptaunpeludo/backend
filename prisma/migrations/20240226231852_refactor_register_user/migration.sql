/*
  Warnings:

  - You are about to drop the column `address` on the `ContactInfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ContactInfo" DROP COLUMN "address" CASCADE;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dni" DROP NOT NULL,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
