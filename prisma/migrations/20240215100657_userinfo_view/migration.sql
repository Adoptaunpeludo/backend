-- This is an empty migration.


CREATE VIEW "UserInfo" AS
  SELECT u.id, u.email, u.username, u."firstName", u."lastName", u.dni, u.role,
    u."createdAt", u."updatedAt", u."verifiedAt", u.avatar, u."isOnline", s.description, s.cif, s."legalForms", s."veterinaryFacilities", s.facilities, s."ownVet", s.images,
    ci."phoneNumber", ci.address, c.name as city, sm.*
    FROM "User" u 
    INNER JOIN "Shelter" s on u.id = s.id 
    INNER JOIN "ContactInfo" ci on u.id = ci.id
    INNER JOIN "City" c on ci."cityId" = c.id
    INNER JOIN "SocialMedia" sm on u.id = sm."shelterId";

