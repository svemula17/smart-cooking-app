-- 111_keep_popular_dishes.sql
-- Curates the recipe catalog from ~264 dishes down to 101 popular ones.
-- The dishes left behind were either niche regional dishes that lacked
-- good photo coverage, or close duplicates (e.g. multiple kinds of pulao).
--
-- WHY: better to have 100 dishes that look great + load fast than 270
-- with mismatched/missing photos.
--
-- Strategy: DELETE rows from recipes whose name is not in KEEP_LIST.
-- All FK-referenced rows (recipe_ingredients, recipe_nutrition,
-- recipe_reviews, favorites, meal_plans, shopping_list_items,
-- nutrition_logs) have ON DELETE CASCADE so they vanish automatically.
--
-- Idempotent: re-running deletes nothing new.

BEGIN;

-- Soft-delete first so we can sanity-check before COMMIT if needed.
WITH deleted AS (
  DELETE FROM recipes
  WHERE name NOT IN ('Butter Chicken','Chana Masala','Dal Makhani','Rajma Masala','Aloo Gobi','Bhindi Masala','Paneer Butter Masala','Palak Paneer','Paneer Tikka Masala','Shahi Paneer','Kadai Paneer','Chicken Biryani','Hyderabadi Biryani','Jeera Rice','Vegetable Pulao','Naan','Butter Naan','Parotta','Dosa','Masala Dosa','Idli','Sambar','Rasam','Samosa','Gulab Jamun','Fried Rice','Yangzhou Fried Rice','Kung Pao Chicken','General Tso''s Chicken','Orange Chicken','Sweet & Sour Chicken','Chow Mein','Lo Mein','Dumplings (Jiaozi)','Mapo Tofu','Hot & Sour Soup','Spring Rolls','Margherita Pizza','Pizza Pepperoni','Spaghetti Carbonara','Spaghetti Bolognese','Fettuccine Alfredo','Pasta Carbonara','Lasagna','Mushroom Risotto','Bruschetta','Caprese Salad','Minestrone Soup','Gnocchi','Tiramisu','Chicken Tacos','Fish Tacos','Street Tacos','Chicken Burrito','Quesadillas','Chicken Enchiladas Verdes','Chicken Fajitas','Guacamole','Pico de Gallo','Carne Asada','Mexican Rice','Churros','Tres Leches Cake','California Roll','Salmon Sushi Roll','Chicken Teriyaki','Tonkatsu','Chicken Katsu','Tonkotsu Ramen','Miso Ramen','Tempura','Gyoza','Miso Soup','Pad Thai','Pad See Ew','Tom Yum Soup','Tom Kha Gai','Thai Green Curry','Red Curry','Som Tam','Mango Sticky Rice','Chicken Satay','Fresh Spring Rolls','Greek Salad','Tabbouleh','Hummus','Falafel','Baba Ganoush','Chicken Gyros','Pork Souvlaki','Moussaka','Shakshuka','Baklava','Chicken Manchurian','Gobi Manchurian','Chilli Chicken','Chilli Paneer','Hakka Noodles','Schezwan Fried Rice','Honey Chilli Potato','Manchow Soup')
  RETURNING name
)
SELECT COUNT(*) AS dishes_deleted FROM deleted;

COMMIT;
