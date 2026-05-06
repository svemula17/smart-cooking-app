import React from 'react';
import { Image, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { Recipe } from '../types';
import { colors } from '../theme/colors';
import { getRecipeImage } from '../utils/recipeImages';

const CUISINE_EMOJI: Record<string, string> = {
  Indian: '🍛', Chinese: '🥢', Italian: '🍝', Mexican: '🌮',
  Thai: '🍜', Japanese: '🍱', Mediterranean: '🫒', American: '🍔',
  French: '🥐', 'Indo-Chinese': '🍜',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: '#4CAF50',
  Medium: '#F9E795',
  Hard: '#F96167',
};

const DIFFICULTY_TEXT: Record<string, string> = {
  Easy: '#2E7D32',
  Medium: '#7a6010',
  Hard: '#fff',
};

function StarRating({ rating, total }: { rating: number; total: number }) {
  const stars = Math.round(rating);
  return (
    <View style={styles.starRow}>
      <Text style={styles.stars}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</Text>
      <Text style={styles.starCount}>{rating.toFixed(1)} ({total})</Text>
    </View>
  );
}

export interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  nutrition?: { calories: number; protein_g: number; carbs_g: number; fat_g: number } | null;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, nutrition }) => {
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const localImage = getRecipeImage(recipe.name);
  const diffBg   = DIFFICULTY_COLOR[recipe.difficulty] ?? '#E0E0E0';
  const diffTxt  = DIFFICULTY_TEXT[recipe.difficulty] ?? '#333';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Image */}
      <View style={styles.imageWrapper}>
        {localImage ? (
          <Image source={localImage} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.cuisineEmoji}>{CUISINE_EMOJI[recipe.cuisine_type] ?? '🍽️'}</Text>
          </View>
        )}
        <View style={[styles.diffBadge, { backgroundColor: diffBg }]}>
          <Text style={[styles.diffText, { color: diffTxt }]}>{recipe.difficulty}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
        <Text style={styles.cuisine}>{recipe.cuisine_type} · ⏱ {totalTime}m · 👥 {recipe.servings} servings</Text>

        {/* Nutrition grid */}
        {nutrition && (
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.calories }]}>{nutrition.calories}</Text>
              <Text style={styles.nutritionLabel}>cal</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.protein }]}>{nutrition.protein_g}g</Text>
              <Text style={styles.nutritionLabel}>protein</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.carbs }]}>{nutrition.carbs_g}g</Text>
              <Text style={styles.nutritionLabel}>carbs</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: colors.fat }]}>{nutrition.fat_g}g</Text>
              <Text style={styles.nutritionLabel}>fat</Text>
            </View>
          </View>
        )}

        <StarRating rating={recipe.average_rating} total={recipe.total_ratings} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrapper: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuisineEmoji: {
    fontSize: 56,
  },
  diffBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  cuisine: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  nutritionGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  nutritionLabel: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 1,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    fontSize: 13,
    color: '#F9A825',
    letterSpacing: 1,
  },
  starCount: {
    fontSize: 11,
    color: colors.textLight,
  },
});
