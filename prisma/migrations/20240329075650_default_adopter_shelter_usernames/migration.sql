/*
  Warnings:

  - The primary key for the `AdoptionChat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AdoptionChat` table. All the data in the column will be lost.
  - The primary key for the `ChatMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adoptionChatId` on the `ChatMessage` table. All the data in the column will be lost.
  - The `id` column on the `ChatMessage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `adoptionChatSlug` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_adoptionChatId_fkey";

-- DropForeignKey
ALTER TABLE "_animal" DROP CONSTRAINT "_animal_A_fkey";

-- DropForeignKey
ALTER TABLE "_participants" DROP CONSTRAINT "_participants_A_fkey";

-- AlterTable
ALTER TABLE "AdoptionChat" DROP CONSTRAINT "AdoptionChat_pkey",
DROP COLUMN "id",
ALTER COLUMN "adopterUsername" SET DEFAULT '',
ALTER COLUMN "shelterUsername" SET DEFAULT '',
ADD CONSTRAINT "AdoptionChat_pkey" PRIMARY KEY ("slug");

-- AlterTable
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_pkey",
DROP COLUMN "adoptionChatId",
ADD COLUMN     "adoptionChatSlug" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_adoptionChatSlug_fkey" FOREIGN KEY ("adoptionChatSlug") REFERENCES "AdoptionChat"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_animal" ADD CONSTRAINT "_animal_A_fkey" FOREIGN KEY ("A") REFERENCES "AdoptionChat"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participants" ADD CONSTRAINT "_participants_A_fkey" FOREIGN KEY ("A") REFERENCES "AdoptionChat"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
