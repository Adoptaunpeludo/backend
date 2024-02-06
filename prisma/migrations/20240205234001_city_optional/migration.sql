-- DropForeignKey
ALTER TABLE "ContactInfo" DROP CONSTRAINT "ContactInfo_cityId_fkey";

-- AlterTable
ALTER TABLE "Adopter" ALTER COLUMN "firstName" SET DEFAULT '';

-- AlterTable
ALTER TABLE "ContactInfo" ALTER COLUMN "cityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
