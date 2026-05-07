// Local recipe images. Each entry maps every DB-name variant to the same require().

const recipeImages: { [key: string]: number } = {
  // ─── Indian ───────────────────────────────────────────────────────────────
  'Chicken Biryani':   require('../../assets/recipes/indian/chicken-biryani.jpg'),
  'Butter Chicken':    require('../../assets/recipes/indian/butter-chicken.jpg'),
  'Palak Paneer':      require('../../assets/recipes/indian/palak-paneer.jpg'),
  'Dal Makhani':       require('../../assets/recipes/indian/dal-makhani.jpg'),
  'Tandoori Chicken':  require('../../assets/recipes/indian/tandoori-chicken.jpg'),
  'Samosa':            require('../../assets/recipes/indian/samosa.jpg'),
  'Naan':              require('../../assets/recipes/indian/naan.jpg'),
  'Butter Naan':       require('../../assets/recipes/indian/naan.jpg'),
  'Aloo Gobi':         require('../../assets/recipes/indian/aloo-gobi.jpg'),
  'Chana Masala':      require('../../assets/recipes/indian/chana-masala.jpg'),
  'Paneer Tikka':      require('../../assets/recipes/indian/paneer-tikka.jpg'),
  'Rajma Chawal':      require('../../assets/recipes/indian/rajma-chawal.jpg'),
  'Masala Dosa':       require('../../assets/recipes/indian/masala-dosa.jpg'),

  // ─── Chinese ──────────────────────────────────────────────────────────────
  'Fried Rice':             require('../../assets/recipes/chinese/fried-rice.jpg'),
  'Sweet and Sour Chicken': require('../../assets/recipes/chinese/sweet-sour-chicken.jpg'),
  'Sweet & Sour Chicken':   require('../../assets/recipes/chinese/sweet-sour-chicken.jpg'),
  'Kung Pao Chicken':       require('../../assets/recipes/chinese/kung-pao-chicken.jpg'),
  'Dumplings':              require('../../assets/recipes/chinese/dumplings.jpg'),
  'Dumplings (Jiaozi)':     require('../../assets/recipes/chinese/dumplings.jpg'),
  'Pork Dumplings':         require('../../assets/recipes/chinese/dumplings.jpg'),
  'Hot and Sour Soup':      require('../../assets/recipes/chinese/hot-sour-soup.jpg'),
  'Hot & Sour Soup':        require('../../assets/recipes/chinese/hot-sour-soup.jpg'),
  'Mapo Tofu':              require('../../assets/recipes/chinese/mapo-tofu.jpg'),
  'Beef and Broccoli':      require('../../assets/recipes/chinese/beef-broccoli.jpg'),

  // ─── Indo-Chinese ─────────────────────────────────────────────────────────
  'Chicken Manchurian':  require('../../assets/recipes/indo-chinese/chicken-manchurian.jpg'),
  'Hakka Noodles':       require('../../assets/recipes/indo-chinese/hakka-noodles.jpg'),
  'Gobi Manchurian':     require('../../assets/recipes/indo-chinese/gobi-manchurian.jpg'),
  'Schezwan Fried Rice': require('../../assets/recipes/indo-chinese/schezwan-fried-rice.jpg'),
  'Chilli Paneer':       require('../../assets/recipes/indo-chinese/chilli-paneer.jpg'),

  // ─── Italian ──────────────────────────────────────────────────────────────
  'Pasta Carbonara':      require('../../assets/recipes/italian/pasta-carbonara.jpg'),
  'Margherita Pizza':     require('../../assets/recipes/italian/margherita-pizza.jpg'),
  'Risotto':              require('../../assets/recipes/italian/risotto.jpg'),
  'Mushroom Risotto':     require('../../assets/recipes/italian/risotto.jpg'),
  'Lasagna':              require('../../assets/recipes/italian/lasagna.jpg'),
  'Beef Lasagna':         require('../../assets/recipes/italian/lasagna.jpg'),
  'Tiramisu':             require('../../assets/recipes/italian/tiramisu.jpg'),
  'Spaghetti Bolognese':  require('../../assets/recipes/italian/spaghetti-bolognese.jpg'),
  'Caprese Salad':        require('../../assets/recipes/italian/caprese-salad.jpg'),

  // ─── Mexican ──────────────────────────────────────────────────────────────
  'Tacos':                     require('../../assets/recipes/mexican/tacos.jpg'),
  'Street Tacos':              require('../../assets/recipes/mexican/tacos.jpg'),
  'Carne Asada Tacos':         require('../../assets/recipes/mexican/tacos.jpg'),
  'Burritos':                  require('../../assets/recipes/mexican/burritos.jpg'),
  'Bean and Cheese Burrito':   require('../../assets/recipes/mexican/burritos.jpg'),
  'Chicken Burrito':           require('../../assets/recipes/mexican/burritos.jpg'),
  'Enchiladas':                require('../../assets/recipes/mexican/enchiladas.jpg'),
  'Cheese Enchiladas':         require('../../assets/recipes/mexican/enchiladas.jpg'),
  'Chicken Enchiladas Verdes': require('../../assets/recipes/mexican/enchiladas.jpg'),
  'Guacamole':                 require('../../assets/recipes/mexican/guacamole.jpg'),
  'Classic Guacamole':         require('../../assets/recipes/mexican/guacamole.jpg'),
  'Quesadillas':               require('../../assets/recipes/mexican/quesadillas.jpg'),
  'Cheese Quesadilla':         require('../../assets/recipes/mexican/quesadillas.jpg'),
  'Chicken Fajitas':           require('../../assets/recipes/mexican/chicken-fajitas.jpg'),
  'Pico de Gallo':             require('../../assets/recipes/mexican/pico-de-gallo.jpg'),

  // ─── Thai ─────────────────────────────────────────────────────────────────
  'Pad Thai':           require('../../assets/recipes/thai/pad-thai.jpg'),
  'Green Curry':        require('../../assets/recipes/thai/green-curry.jpg'),
  'Thai Green Curry':   require('../../assets/recipes/thai/green-curry.jpg'),
  'Tom Yum Soup':       require('../../assets/recipes/thai/tom-yum-soup.jpg'),
  'Spring Rolls':       require('../../assets/recipes/thai/spring-rolls.jpg'),
  'Fresh Spring Rolls': require('../../assets/recipes/thai/spring-rolls.jpg'),
  'Mango Sticky Rice':  require('../../assets/recipes/thai/mango-sticky-rice.jpg'),
  'Tom Kha Gai':        require('../../assets/recipes/thai/tom-kha-gai.jpg'),
  'Pad See Ew':         require('../../assets/recipes/thai/pad-see-ew.jpg'),

  // ─── Japanese ─────────────────────────────────────────────────────────────
  'Chicken Teriyaki':   require('../../assets/recipes/japanese/chicken-teriyaki.jpg'),
  'Miso Soup':          require('../../assets/recipes/japanese/miso-soup.jpg'),
  'Chicken Katsu':      require('../../assets/recipes/japanese/chicken-katsu.jpg'),
  'Salmon Sushi Bowl':  require('../../assets/recipes/japanese/salmon-sushi-bowl.jpg'),
  'Vegetable Ramen':    require('../../assets/recipes/japanese/vegetable-ramen.jpg'),

  // ─── Mediterranean ────────────────────────────────────────────────────────
  'Hummus':       require('../../assets/recipes/mediterranean/hummus.jpg'),
  'Greek Salad':  require('../../assets/recipes/mediterranean/greek-salad.jpg'),
  'Falafel':      require('../../assets/recipes/mediterranean/falafel.jpg'),
  'Shakshuka':    require('../../assets/recipes/mediterranean/shakshuka.jpg'),
  'Tabbouleh':    require('../../assets/recipes/mediterranean/tabbouleh.jpg'),
};

export function getRecipeImage(recipeName: string): number | null {
  return recipeImages[recipeName] ?? null;
}
