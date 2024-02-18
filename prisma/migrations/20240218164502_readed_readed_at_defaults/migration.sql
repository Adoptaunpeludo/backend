-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "readed" SET DEFAULT false,
ALTER COLUMN "readedAt" DROP NOT NULL;
