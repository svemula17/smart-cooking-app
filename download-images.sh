#!/bin/bash

# Create folders
mkdir -p mobile/assets/recipes/{indian,chinese,italian,mexican,thai}

# Indian dishes
curl -o mobile/assets/recipes/indian/chicken-biryani.jpg "https://source.unsplash.com/800x600/?chicken-biryani,food"
curl -o mobile/assets/recipes/indian/butter-chicken.jpg "https://source.unsplash.com/800x600/?butter-chicken,food"
curl -o mobile/assets/recipes/indian/palak-paneer.jpg "https://source.unsplash.com/800x600/?palak-paneer,food"
curl -o mobile/assets/recipes/indian/dal-makhani.jpg "https://source.unsplash.com/800x600/?dal-makhani,food"
curl -o mobile/assets/recipes/indian/tandoori-chicken.jpg "https://source.unsplash.com/800x600/?tandoori-chicken,food"
curl -o mobile/assets/recipes/indian/samosa.jpg "https://source.unsplash.com/800x600/?samosa,food"
curl -o mobile/assets/recipes/indian/naan.jpg "https://source.unsplash.com/800x600/?naan-bread,food"
curl -o mobile/assets/recipes/indian/aloo-gobi.jpg "https://source.unsplash.com/800x600/?aloo-gobi,food"
curl -o mobile/assets/recipes/indian/chana-masala.jpg "https://source.unsplash.com/800x600/?chana-masala,food"
curl -o mobile/assets/recipes/indian/paneer-tikka.jpg "https://source.unsplash.com/800x600/?paneer-tikka,food"

# Chinese dishes
curl -o mobile/assets/recipes/chinese/fried-rice.jpg "https://source.unsplash.com/800x600/?fried-rice,food"
curl -o mobile/assets/recipes/chinese/sweet-sour-chicken.jpg "https://source.unsplash.com/800x600/?sweet-sour-chicken,food"
curl -o mobile/assets/recipes/chinese/kung-pao-chicken.jpg "https://source.unsplash.com/800x600/?kung-pao-chicken,food"
curl -o mobile/assets/recipes/chinese/dumplings.jpg "https://source.unsplash.com/800x600/?dumplings,food"
curl -o mobile/assets/recipes/chinese/hot-sour-soup.jpg "https://source.unsplash.com/800x600/?hot-sour-soup,food"

# Italian dishes
curl -o mobile/assets/recipes/italian/pasta-carbonara.jpg "https://source.unsplash.com/800x600/?pasta-carbonara,food"
curl -o mobile/assets/recipes/italian/margherita-pizza.jpg "https://source.unsplash.com/800x600/?margherita-pizza,food"
curl -o mobile/assets/recipes/italian/risotto.jpg "https://source.unsplash.com/800x600/?risotto,food"
curl -o mobile/assets/recipes/italian/lasagna.jpg "https://source.unsplash.com/800x600/?lasagna,food"
curl -o mobile/assets/recipes/italian/tiramisu.jpg "https://source.unsplash.com/800x600/?tiramisu,food"

# Mexican dishes
curl -o mobile/assets/recipes/mexican/tacos.jpg "https://source.unsplash.com/800x600/?tacos,food"
curl -o mobile/assets/recipes/mexican/burritos.jpg "https://source.unsplash.com/800x600/?burrito,food"
curl -o mobile/assets/recipes/mexican/enchiladas.jpg "https://source.unsplash.com/800x600/?enchiladas,food"
curl -o mobile/assets/recipes/mexican/guacamole.jpg "https://source.unsplash.com/800x600/?guacamole,food"
curl -o mobile/assets/recipes/mexican/quesadillas.jpg "https://source.unsplash.com/800x600/?quesadilla,food"

# Thai dishes
curl -o mobile/assets/recipes/thai/pad-thai.jpg "https://source.unsplash.com/800x600/?pad-thai,food"
curl -o mobile/assets/recipes/thai/green-curry.jpg "https://source.unsplash.com/800x600/?green-curry,food"
curl -o mobile/assets/recipes/thai/tom-yum-soup.jpg "https://source.unsplash.com/800x600/?tom-yum,food"
curl -o mobile/assets/recipes/thai/spring-rolls.jpg "https://source.unsplash.com/800x600/?spring-rolls,food"
curl -o mobile/assets/recipes/thai/mango-sticky-rice.jpg "https://source.unsplash.com/800x600/?mango-sticky-rice,food"

echo "✅ All 30 images downloaded!"
