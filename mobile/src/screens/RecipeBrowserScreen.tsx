import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { RecipeCard } from '../components/RecipeCard';
import { api } from '../services/api';
import type { Recipe } from '../types';
import { colors } from '../theme/colors';

export function RecipeBrowserScreen({ navigation }: any): JSX.Element {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get<Recipe[]>('/recipes', { params: { q: query } })
      .then((r) => setRecipes(r.data))
      .catch(() => setRecipes([]));
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search recipes..."
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={recipes}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  search: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
});
