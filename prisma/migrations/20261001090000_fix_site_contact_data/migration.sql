UPDATE `SiteConfiguration`
SET
  `address` = CASE
    WHEN `address` = 'Av. Gen. Gurjão, 151 · Central, Macapá - AP, 68900-050'
      THEN 'Av. Gen. Gurjão, 151 - Central, Macapá - AP, 68900-050'
    ELSE `address`
  END,
  `instagramUrl` = CASE
    WHEN `instagramUrl` = 'https://www.instagram.com/jonaselivaldohair/'
      THEN 'https://www.instagram.com/jonas_elivaldo_hair_designers/'
    ELSE `instagramUrl`
  END
WHERE `id` = 'default'
  AND (
    `address` = 'Av. Gen. Gurjão, 151 · Central, Macapá - AP, 68900-050'
    OR `instagramUrl` = 'https://www.instagram.com/jonaselivaldohair/'
  );
