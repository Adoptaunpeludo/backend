/*
  Warnings:

  - Added the required column `animalSlug` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Animal_age_idx";

-- DropIndex
DROP INDEX "Animal_createdBy_idx";

-- DropIndex
DROP INDEX "Animal_gender_idx";

-- DropIndex
DROP INDEX "Animal_name_idx";

-- DropIndex
DROP INDEX "Animal_size_idx";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "animalSlug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AdoptionChat" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "adopterUsername" TEXT NOT NULL,
    "shelterUsername" TEXT NOT NULL,

    CONSTRAINT "AdoptionChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "adoptionChatId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_animal" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_participants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionChat_slug_adopterUsername_shelterUsername_key" ON "AdoptionChat"("slug", "adopterUsername", "shelterUsername");

-- CreateIndex
CREATE UNIQUE INDEX "_animal_AB_unique" ON "_animal"("A", "B");

-- CreateIndex
CREATE INDEX "_animal_B_index" ON "_animal"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_participants_AB_unique" ON "_participants"("A", "B");

-- CreateIndex
CREATE INDEX "_participants_B_index" ON "_participants"("B");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_adoptionChatId_fkey" FOREIGN KEY ("adoptionChatId") REFERENCES "AdoptionChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_animal" ADD CONSTRAINT "_animal_A_fkey" FOREIGN KEY ("A") REFERENCES "AdoptionChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_animal" ADD CONSTRAINT "_animal_B_fkey" FOREIGN KEY ("B") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants" ADD CONSTRAINT "_participants_A_fkey" FOREIGN KEY ("A") REFERENCES "AdoptionChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants" ADD CONSTRAINT "_participants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
