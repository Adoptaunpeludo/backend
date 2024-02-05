-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_adminID_fkey";

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
