-- AlterTable
ALTER TABLE "Shelter" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "cif" DROP NOT NULL,
ALTER COLUMN "cif" SET DEFAULT '';
