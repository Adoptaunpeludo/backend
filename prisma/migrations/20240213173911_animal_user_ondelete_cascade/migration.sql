-- DropForeignKey
ALTER TABLE "Animal" DROP CONSTRAINT "Animal_createdBy_fkey";

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Shelter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
