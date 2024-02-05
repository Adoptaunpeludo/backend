/*
  Warnings:

  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Adopter` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Shelter` table. All the data in the column will be lost.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Adopter" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Shelter" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "user_roles" NOT NULL;
