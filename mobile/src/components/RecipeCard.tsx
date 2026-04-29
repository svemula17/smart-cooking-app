import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import type { Recipe } from '../types';
import { colors } from '../theme/colors';

interface Props { recipe: Recipe; onPress: () => void; }

export function RecipeCard({ recipe, onPress }: Props): JSX.Element {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {recipe.imageUrl ? <Image source={{ uri: recipe.imageUrl }} style={styles.image} /> : null}
      <View style={styles.body}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.meta}>
          {recipe.cuisine} · {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min · {recipe.nutrition.calories} kcal
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  image: { width: '100%', height: 160 },
  body: { padding: 12 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
