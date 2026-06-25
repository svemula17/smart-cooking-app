import React from 'react';
import { Pressable, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useDispatch, useSelector } from 'react-redux';
import type { Recipe } from '../types';
import { colors } from '../theme/colors';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { getRecipeImage } from '../utils/recipeImages';
import { toggleFavorite, type RootState } from '../store';

const CUISINE_EMOJI: Record<string, string> = {
  Indian: '🍛', Chinese: '🥢', Italian: '🍝', Mexican: '🌮',
  Thai: '🍜', Japanese: '🍱', Mediterranean: '🫒', American: '🍔',
  French: '🥐', 'Indo-Chinese': '🍜',
};

const CUISINE_BG: Record<string, string> = {
  Indian: colors.indian, Chinese: colors.chinese, Italian: colors.italian,
  Mexican: colors.mexican, Thai: colors.thai, Japanese: colors.japanese,
  Mediterranean: colors.mediterranean, American: colors.american, French: colors.french,
  'Indo-Chinese': colors.indoChinese,
};

// Minimal Mono: one neutral dark pill for all difficulties (no decorative color).
const DIFFICULTY_BG = 'rgba(17, 17, 20, 0.78)';

function StarRating({ rating, total }: { rating: number; total: number }) {
  const c = useThemeColors();
  const safeRating = rating ?? 0;
  if (!total) return <Text style={[styles.noRating, { color: c.textLight }]}>New</Text>;
  return (
    <View style={styles.starRow}>
      <Text style={[styles.stars, { color: c.text }]}>★</Text>
      <Text style={[styles.starCount, { color: c.textSecondary }]}>
        {safeRating.toFixed(1)} <Text style={[styles.starCountDim, { color: c.textLight }]}>({total})</Text>
      </Text>
    </View>
  );
}

export interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  nutrition?: { calories: number; protein_g: number; carbs_g: number; fat_g: number } | null;
  /** Two-column grid layout (used by RecipeBrowser). Defaults to false (full-width). */
  compact?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, nutrition, compact = false }) => {
  const c = useThemeColors();
  const dispatch = useDispatch();
  const isFav = useSelector((s: RootState) => s.favorites.ids.includes(recipe.id));
  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
  const diffLevel = recipe.difficulty === 'Hard' ? 3 : recipe.difficulty === 'Medium' ? 2 : 1;

  // Image source preference: remote URL from DB → bundled local asset → cuisine emoji fallback
  const remoteUrl = recipe.image_url && /^https?:\/\//i.test(recipe.image_url) ? recipe.image_url : null;
  const localImage = getRecipeImage(recipe.name);
  const imageSource = remoteUrl ? { uri: remoteUrl } : localImage ?? null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        { backgroundColor: c.surfaceElevated, borderColor: c.border },
        pressed && { transform: [{ scale: 0.985 }], opacity: 0.96 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {/* Image */}
      <View style={[styles.imageWrapper, compact && styles.imageWrapperCompact, { backgroundColor: c.surfaceMuted }]}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={recipe.id}
          />
        ) : (
          <View style={[styles.imageFallback, { backgroundColor: CUISINE_BG[recipe.cuisine_type] ?? c.surfaceMuted }]}>
            <Text style={styles.cuisineEmoji}>{CUISINE_EMOJI[recipe.cuisine_type] ?? '🍽️'}</Text>
          </View>
        )}

        {/* Subtle gradient overlay along bottom for legibility (using a dimmed view) */}
        <View style={styles.imageOverlay} pointerEvents="none" />

        {/* Difficulty meter (bottom-left over image) — mono 3-dot level */}
        <View
          style={[styles.diffBadge, { backgroundColor: DIFFICULTY_BG }]}
          accessibilityLabel={`Difficulty: ${recipe.difficulty || 'Easy'}`}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.diffDot,
                { backgroundColor: i < diffLevel ? '#fff' : 'rgba(255,255,255,0.38)' },
              ]}
            />
          ))}
        </View>

        {/* Time pill (bottom-right over image) */}
        {totalTime > 0 ? (
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>⏱ {totalTime}m</Text>
          </View>
        ) : null}

        {/* Favorite heart (top-right) — refined look */}
        <TouchableOpacity
          style={[styles.heartBtn, isFav && styles.heartBtnActive]}
          onPress={(e) => {
            e.stopPropagation();
            dispatch(toggleFavorite(recipe.id));
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Text style={[styles.heartIcon, isFav && styles.heartIconActive]}>
            {isFav ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={[styles.body, compact && styles.bodyCompact]}>
        <Text style={[styles.title, compact && styles.titleCompact, { color: c.text }]} numberOfLines={2}>
          {recipe.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.cuisineEmojiSmall}>{CUISINE_EMOJI[recipe.cuisine_type] ?? '🍽️'}</Text>
          <Text style={[styles.cuisine, { color: c.textSecondary }]} numberOfLines={1}>
            {recipe.cuisine_type}
          </Text>
        </View>

        {/* Nutrition grid — full-width cards only */}
        {nutrition && !compact ? (
          <View style={[styles.nutritionGrid, { backgroundColor: c.surfaceMuted }]}>
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: c.calories }]}>{nutrition.calories}</Text>
              <Text style={[styles.nutritionLabel, { color: c.textLight }]}>cal</Text>
            </View>
            <View style={[styles.nutritionDivider, { backgroundColor: c.border }]} />
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: c.protein }]}>{nutrition.protein_g}g</Text>
              <Text style={[styles.nutritionLabel, { color: c.textLight }]}>protein</Text>
            </View>
            <View style={[styles.nutritionDivider, { backgroundColor: c.border }]} />
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: c.carbs }]}>{nutrition.carbs_g}g</Text>
              <Text style={[styles.nutritionLabel, { color: c.textLight }]}>carbs</Text>
            </View>
            <View style={[styles.nutritionDivider, { backgroundColor: c.border }]} />
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionValue, { color: c.fat }]}>{nutrition.fat_g}g</Text>
              <Text style={[styles.nutritionLabel, { color: c.textLight }]}>fat</Text>
            </View>
          </View>
        ) : null}

        <StarRating rating={recipe.average_rating ?? 0} total={recipe.total_ratings ?? 0} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCompact: {
    flex: 1,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
  },
  imageWrapper: {
    height: 180,
    position: 'relative',
    backgroundColor: colors.surfaceMuted,
  },
  imageWrapperCompact: {
    height: 108,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.25)',
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
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  diffDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.3,
  },
  timeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  heartBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  heartIcon: {
    fontSize: 19,
    color: colors.primary,
    fontWeight: '900',
    lineHeight: 22,
  },
  heartIconActive: {
    color: colors.onPrimary,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  bodyCompact: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 21,
  },
  titleCompact: {
    fontSize: 13,
    lineHeight: 17,
    minHeight: 34, // 2 lines reserved so 2-column grid stays aligned
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cuisineEmojiSmall: {
    fontSize: 14,
  },
  cuisine: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  nutritionGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingVertical: 10,
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
    fontWeight: '800',
  },
  nutritionLabel: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    fontSize: 13,
    color: colors.warning,
  },
  starCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  starCountDim: {
    color: colors.textLight,
    fontWeight: '400',
  },
  noRating: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
