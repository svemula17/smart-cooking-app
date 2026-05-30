-- 113_user_uploaded_photos_round2.sql
-- 9 more user-uploaded Indian dish photos.

BEGIN;

UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/dosa.jpg'              WHERE name = 'Dosa';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/haleem.jpg'            WHERE name = 'Haleem';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/masala-dosa.jpg'       WHERE name = 'Masala Dosa';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/mysore-masala-dosa.jpg' WHERE name = 'Mysore Masala Dosa';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/natu-kodi-pulusu.jpg'  WHERE name = 'Natu Kodi Pulusu';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/rajma-masala.jpg'      WHERE name = 'Rajma Masala';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/rasgulla.jpg'          WHERE name = 'Rasgulla';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/upma.jpg'              WHERE name = 'Upma';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/medu-vada.jpg'         WHERE name = 'Medu Vada';

COMMIT;
