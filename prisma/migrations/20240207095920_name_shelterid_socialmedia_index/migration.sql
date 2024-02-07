-- DropIndex
DROP INDEX "SocialMedia_name_url_idx";

-- CreateIndex
CREATE INDEX "SocialMedia_name_shelterId_idx" ON "SocialMedia"("name", "shelterId");
