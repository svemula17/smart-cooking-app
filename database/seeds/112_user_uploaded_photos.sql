-- 112_user_uploaded_photos.sql
-- Replaces Unsplash auto-matches with user-uploaded photos for 20 regional
-- Indian dishes where Unsplash had no good match.
--
-- Photos hosted via jsDelivr CDN, mirroring the recipe-photos/ folder
-- in this git repo. Free CDN, low latency, ~100ms loads globally.

BEGIN;

UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/akki-roti.jpg'         WHERE name = 'Akki Roti';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/bendakaya-pulusu.jpg'  WHERE name = 'Bendakaya Pulusu';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/puttu.jpg'             WHERE name = 'Puttu';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/beans-fry.jpg'         WHERE name = 'Beans Fry';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/cabbage-curry.jpg'     WHERE name = 'Cabbage Curry';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/capsicum-masala.jpg'   WHERE name = 'Capsicum Masala';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/carrot-peas-curry.jpg' WHERE name = 'Carrot Peas Curry';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/coconut-rice.jpg'      WHERE name = 'Coconut Rice';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/corn-masala.jpg'       WHERE name = 'Corn Masala';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/curd-rice.jpg'         WHERE name = 'Curd Rice';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/idiappam.jpg'          WHERE name = 'Idiappam';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/jeera-rice.jpg'        WHERE name = 'Jeera Rice';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/lemon-rice.jpg'        WHERE name = 'Lemon Rice';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/majjiga-pulusu.jpeg'   WHERE name = 'Majjiga Pulusu';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/mirchi-bajji.jpg'      WHERE name = 'Mirchi Bajji';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/paneer-bhurji.jpeg'    WHERE name = 'Paneer Bhurji';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/pongal.jpg'            WHERE name = 'Pongal';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/rasam.jpg'             WHERE name = 'Rasam';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/sorakaya-curry.jpg'    WHERE name = 'Sorakaya Curry';
UPDATE recipes SET image_url = 'https://cdn.jsdelivr.net/gh/svemula17/smart-cooking-app@main/recipe-photos/tomato-rice.jpg'       WHERE name = 'Tomato Rice';

COMMIT;
