const recipeImages: Record<string, any> = {
  // Indian
  'Chicken Biryani':  require('../../assets/recipes/indian/chicken-biryani.jpg'),
  'Butter Chicken':   require('../../assets/recipes/indian/butter-chicken.jpg'),
  'Palak Paneer':     require('../../assets/recipes/indian/palak-paneer.jpg'),
  'Dal Makhani':      require('../../assets/recipes/indian/dal-makhani.jpg'),
  'Tandoori Chicken': require('../../assets/recipes/indian/tandoori-chicken.jpg'),
  'Samosa':           require('../../assets/recipes/indian/samosa.jpg'),
  'Naan':             require('../../assets/recipes/indian/naan.jpg'),
  'Aloo Gobi':        require('../../assets/recipes/indian/aloo-gobi.jpg'),
  'Chana Masala':     require('../../assets/recipes/indian/chana-masala.jpg'),
  'Paneer Tikka':     require('../../assets/recipes/indian/paneer-tikka.jpg'),

  // Chinese
  'Fried Rice':             require('../../assets/recipes/chinese/fried-rice.jpg'),
  'Sweet and Sour Chicken': require('../../assets/recipes/chinese/sweet-sour-chicken.jpg'),
  'Kung Pao Chicken':       require('../../assets/recipes/chinese/kung-pao-chicken.jpg'),
  'Dumplings':              require('../../assets/recipes/chinese/dumplings.jpg'),
  'Hot and Sour Soup':      require('../../assets/recipes/chinese/hot-sour-soup.jpg'),

  // Italian
  'Pasta Carbonara':  require('../../assets/recipes/italian/pasta-carbonara.jpg'),
  'Margherita Pizza': require('../../assets/recipes/italian/margherita-pizza.jpg'),
  'Risotto':          require('../../assets/recipes/italian/risotto.jpg'),
  'Lasagna':          require('../../assets/recipes/italian/lasagna.jpg'),
  'Tiramisu':         require('../../assets/recipes/italian/tiramisu.jpg'),

  // Mexican
  'Tacos':       require('../../assets/recipes/mexican/tacos.jpg'),
  'Burritos':    require('../../assets/recipes/mexican/burritos.jpg'),
  'Enchiladas':  require('../../assets/recipes/mexican/enchiladas.jpg'),
  'Guacamole':   require('../../assets/recipes/mexican/guacamole.jpg'),
  'Quesadillas': require('../../assets/recipes/mexican/quesadillas.jpg'),

  // Thai
  'Pad Thai':          require('../../assets/recipes/thai/pad-thai.jpg'),
  'Green Curry':       require('../../assets/recipes/thai/green-curry.jpg'),
  'Tom Yum Soup':      require('../../assets/recipes/thai/tom-yum-soup.jpg'),
  'Spring Rolls':      require('../../assets/recipes/thai/spring-rolls.jpg'),
  'Mango Sticky Rice': require('../../assets/recipes/thai/mango-sticky-rice.jpg'),
};

export function getRecipeImage(recipeName: string): any {
  return recipeImages[recipeName] ?? null;
}
