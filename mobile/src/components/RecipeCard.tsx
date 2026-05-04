import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { Recipe } from '../types';
import { colors } from '../theme/colors';

const CUISINE_EMOJI: Record<string, string> = {
  Indian: '🍛', Chinese: '🥢', Italian: '🍝', Mexican: '🌮',
  Thai: '🍜', Japanese: '🍱', Mediterranean: '🫒', American: '🍔',
  French: '🥐', 'Indo-Chinese': '🍜',
};

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  Easy:   { bg: colors.easy,   text: colors.easyText },
  Medium: { bg: colors.medium, text: colors.mediumText },
  Hard:   { bg: colors.hard,   text: colors.hardText },
};

function StarRating({ rating, total }: { rating: number; total: number }) {
  const stars = Math.round(rating);
  return (
    <View style={styles.starRow}>
      <Text style={styles.stars}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</Text>
      <Text style={styles.starCount}>({total})</Text>
    </View>
  );
}

export interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  nutrition?: { calories: number; protein_g: number } | null;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, nutrition }) => {
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const diffStyle = DIFFICULTY_STYLE[recipe.difficulty] ?? DIFFICULTY_STYLE.Easy;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Image placeholder */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.cuisineEmoji}>
          {CUISINE_EMOJI[recipe.cuisine_type] ?? '🍽️'}
        </Text>
        <View style={[styles.diffBadge, { backgroundColor: diffStyle.bg }]}>
          <Text style={[styles.diffText, { color: diffStyle.text }]}>
            {recipe.difficulty}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
        <Text style={styles.cuisine}>{recipe.cuisine_type}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Text style={styles.stat}>⏱ {totalTime}m</Text>
          {nutrition && (
            <>
              <Text style={styles.statDot}>·</Text>
              <Text style={styles.stat}>🔥 {nutrition.calories} kcal</Text>
              <Text style={styles.statDot}>·</Text>
              <Text style={styles.stat}>💪 {nutrition.protein_g}g</Text>
            </>
          )}
          {!nutrition && (
            <>
              <Text style={styles.statDot}>·</Text>
              <Text style={styles.stat}>👥 {recipe.servings} servings</Text>
            </>
          )}
        </View>

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
  imagePlaceholder: {
    height: 140,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
    lineHeight: 21,
  },
  cuisine: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  stat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDot: {
    fontSize: 12,
    color: colors.border,
    marginHorizontal: 2,
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
