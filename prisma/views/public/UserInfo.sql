SELECT
  u.id,
  u.email,
  u.username,
  u."firstName",
  u."lastName",
  u.dni,
  u.role,
  u."createdAt",
  u."updatedAt",
  u."verifiedAt",
  u.avatar,
  u."isOnline",
  s.description,
  s.cif,
  s."legalForms",
  s."veterinaryFacilities",
  s.facilities,
  s."ownVet",
  s.images,
  ci."phoneNumber",
  ci.address,
  c.name AS city,
  sm.name,
  sm.url
FROM
  (
    (
      (
        (
          "User" u
          LEFT JOIN "Shelter" s ON ((u.id = s.id))
        )
        JOIN "ContactInfo" ci ON ((u.id = ci.id))
      )
      JOIN "City" c ON ((ci."cityId" = c.id))
    )
    LEFT JOIN "SocialMedia" sm ON ((u.id = sm."shelterId"))
  );