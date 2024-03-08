-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" TEXT NOT NULL,
    "adopterId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "shelterId" TEXT NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT,
    "message" JSONB NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_adopterId_animalId_shelterId_key" ON "ChatRoom"("adopterId", "animalId", "shelterId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
