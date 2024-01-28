-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "adopterId" INTEGER,
    "shelterId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adopter" (
    "id" SERIAL NOT NULL,
    "dni" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Adopter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shelter" (
    "id" SERIAL NOT NULL,
    "cif" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Shelter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Adopter_dni_key" ON "Adopter"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Shelter_cif_key" ON "Shelter"("cif");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_adopterId_fkey" FOREIGN KEY ("adopterId") REFERENCES "Adopter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "Shelter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
