const recipeImageUrls: { [key: string]: string } = {
  // Indian
  'Chicken Biryani':  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop',
  'Butter Chicken':   'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop',
  'Palak Paneer':     'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop',
  'Dal Makhani':      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
  'Tandoori Chicken': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop',
  'Samosa':           'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop',
  'Naan':             'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  'Butter Naan':      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  'Aloo Gobi':        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  'Chana Masala':     'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  'Paneer Tikka':     'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop',

  // Chinese
  'Fried Rice':             'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
  'Sweet and Sour Chicken': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
  'Sweet & Sour Chicken':   'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
  'Kung Pao Chicken':       'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop',
  'Dumplings':              'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
  'Dumplings (Jiaozi)':     'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
  'Pork Dumplings':         'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop',
  'Hot and Sour Soup':      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
  'Hot & Sour Soup':        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',

  // Italian
  'Pasta Carbonara':  'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop',
  'Margherita Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
  'Risotto':          'https://images.unsplash.com/photo-1476124369491-c7addf7a5841?w=800&h=600&fit=crop',
  'Mushroom Risotto': 'https://images.unsplash.com/photo-1476124369491-c7addf7a5841?w=800&h=600&fit=crop',
  'Lasagna':          'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
  'Beef Lasagna':     'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
  'Tiramisu':         'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop',

  // Mexican
  'Tacos':                     'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
  'Street Tacos':              'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
  'Carne Asada Tacos':         'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
  'Burritos':                  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
  'Bean and Cheese Burrito':   'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
  'Chicken Burrito':           'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
  'Enchiladas':                'https://images.unsplash.com/photo-1599974715112-478a42f2f7a0?w=800&h=600&fit=crop',
  'Cheese Enchiladas':         'https://images.unsplash.com/photo-1599974715112-478a42f2f7a0?w=800&h=600&fit=crop',
  'Chicken Enchiladas Verdes': 'https://images.unsplash.com/photo-1599974715112-478a42f2f7a0?w=800&h=600&fit=crop',
  'Guacamole':                 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=800&h=600&fit=crop',
  'Classic Guacamole':         'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=800&h=600&fit=crop',
  'Quesadillas':               'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&h=600&fit=crop',
  'Cheese Quesadilla':         'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&h=600&fit=crop',

  // Thai
  'Pad Thai':          'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
  'Green Curry':       'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop',
  'Thai Green Curry':  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop',
  'Tom Yum Soup':      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&h=600&fit=crop',
  'Spring Rolls':      'https://images.unsplash.com/photo-1567623117034-9106a7df3c18?w=800&h=600&fit=crop',
  'Fresh Spring Rolls':'https://images.unsplash.com/photo-1567623117034-9106a7df3c18?w=800&h=600&fit=crop',
  'Mango Sticky Rice': 'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=800&h=600&fit=crop',
};

export function getRecipeImage(recipeName: string): { uri: string } | null {
  const url = recipeImageUrls[recipeName];
  return url ? { uri: url } : null;
}
