-- 108_image_variety.sql
-- Second pass on recipe images — adds more dish-category-specific
-- Unsplash photo IDs so the cuisine fallbacks don't repeat as much.
-- All photo IDs HTTP 200 verified.

BEGIN;

-- Dal / lentil dishes
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1542367592-8849eb950fd8?w=600&q=80'
  WHERE name ILIKE '%dal%' OR name ILIKE '%pappu%' OR name = 'Kadala Curry';

-- Soup bowls
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80'
  WHERE name ILIKE '%soup%' OR name = 'Rasam' OR name = 'Pulusu' OR name ILIKE '%kuzhambu%' OR name = 'Avgolemono Soup';

-- Pancake / dosa style
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80'
  WHERE name IN ('Pesarattu','Uttapam','Rava Dosa','Akki Roti','Appam') OR name = 'Okonomiyaki';

-- Asian noodle bowls (non-ramen)
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=600&q=80'
  WHERE name IN ('Pad Thai','Pad See Ew','Chow Mein','Lo Mein','Singapore Noodles','Hakka Noodles','Schezwan Fried Rice','Yaki Soba','Udon Noodle Soup','Drunken Noodles','Chilli Garlic Noodles','American Chopsuey');

-- Salad / bowls
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'
  WHERE name ILIKE '%salad%' OR name = 'Som Tam' OR name = 'Tabbouleh' OR name = 'Thai Mango Salad' OR name = 'Larb' OR name = 'Thai Glass Noodle Salad';

-- Stew / heavy curry
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&q=80'
  WHERE name IN ('Massaman Curry','Red Curry','Panang Curry','Thai Green Curry','Chicken Stew','Beef and Broccoli','Mongolian Beef','Mole Poblano','Pozole Rojo','Haleem');

-- Grilled meats / kebabs / steak
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80'
  WHERE name IN ('Tandoori Chicken','Yakitori','Pork Souvlaki','Lamb Kofta','Carne Asada','Carne Asada Tacos','Chicken Satay','Tonkatsu','Chicken Katsu','Char Siu','Thai Basil Beef','Chettinad Chicken','Andhra Chicken Curry','Kodi Vepudu','Chicken Tikka Masala');

-- Sushi rolls
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80'
  WHERE name ILIKE '%sushi%' OR name ILIKE '%roll%' OR name = 'Onigiri' OR name = 'Salmon Sushi Bowl';

-- Mediterranean platter
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=600&q=80'
  WHERE cuisine_type = 'Mediterranean' AND name IN ('Hummus','Tzatziki','Baba Ganoush','Falafel','Mediterranean Couscous Salad','Greek Salad','Stuffed Grape Leaves');

-- Veg curry / bowls with vegetables
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=600&q=80'
  WHERE name IN ('Aloo Gobi','Bhindi Masala','Cauliflower Curry','Capsicum Masala','Mushroom Masala','Veg Kolhapuri','Veg Jalfrezi','Veg Kurma','Mixed Vegetable Curry','Tawa Vegetable Curry','Ratatouille','Vegetable Stir Fry');

-- Smoothie/sweet dishes
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80'
  WHERE name IN ('Mango Sticky Rice','Tres Leches Cake','Payasam','Panna Cotta','Tiramisu','Cannoli');

COMMIT;
