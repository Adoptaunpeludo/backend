ALTER TABLE "Adopters" ADD CONSTRAINT "account_user_role" CHECK ("role" IN ('admin', 'shelter', 'adopter'));

ALTER TABLE "Shelters" ADD CONSTRAINT "account_user_role" CHECK ("role" IN ('admin', 'shelter', 'adopter'));

ALTER TABLE "Admins" ADD CONSTRAINT "account_user_role" CHECK ("role" IN ('admin', 'shelter', 'adopter'));
