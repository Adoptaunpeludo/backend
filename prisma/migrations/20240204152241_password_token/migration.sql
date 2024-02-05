-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordToken" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "verificationToken" SET DEFAULT '';
