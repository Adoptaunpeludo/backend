/*
  Warnings:

  - You are about to drop the `UserFav` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Animal" DROP CONSTRAINT "Animal_adoptedBy_fkey";

-- DropForeignKey
ALTER TABLE "UserFav" DROP CONSTRAINT "UserFav_animalId_fkey";

-- DropForeignKey
ALTER TABLE "UserFav" DROP CONSTRAINT "UserFav_userId_fkey";

-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "UserFav";

-- CreateTable
CREATE TABLE "_userFav" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_userFav_AB_unique" ON "_userFav"("A", "B");

-- CreateIndex
CREATE INDEX "_userFav_B_index" ON "_userFav"("B");

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFav" ADD CONSTRAINT "_userFav_A_fkey" FOREIGN KEY ("A") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFav" ADD CONSTRAINT "_userFav_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
