-- DropForeignKey
ALTER TABLE "Adopter" DROP CONSTRAINT "Adopter_adopterID_fkey";

-- DropForeignKey
ALTER TABLE "ContactInfo" DROP CONSTRAINT "ContactInfo_userID_fkey";

-- DropForeignKey
ALTER TABLE "Shelter" DROP CONSTRAINT "Shelter_shelterID_fkey";

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adopter" ADD CONSTRAINT "Adopter_adopterID_fkey" FOREIGN KEY ("adopterID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shelter" ADD CONSTRAINT "Shelter_shelterID_fkey" FOREIGN KEY ("shelterID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
