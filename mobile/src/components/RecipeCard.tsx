import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useDispatch, useSelector } from 'react-redux';
import type { Recipe } from '../types';
import { colors } from '../theme/colors';
import { getRecipeImage } from '../utils/recipeImages';
import { toggleFavorite, type RootState } from '../store';

const CUISINE_EMOJI: Record<string, string> = {
  Indian: '🍛', Chinese: '🥢', Italian: '🍝', Mexican: '🌮',
  Thai: '🍜', Japanese: '🍱', Mediterranean: '🫒', American: '🍔',
  French: '🥐', 'Indo-Chinese': '🍜',
};

const CUISINE_BG: Record<string, string> = {
  Indian: '#F5E6D3', Chinese: '#FFF0E0', Italian: '#FDE8E8',
  Mexican: '#E8F5E9', Thai: '#E0F4F1', Japanese: '#F0E8F5',
  Mediterranean: '#E8EFF5', American: '#FFF3E0', French: '#FFF8E1',
  'Indo-Chinese': '#FFE8E0',
};

const DIFFICULTY_BG: Record<string, string> = {
  Easy: 'rgba(76, 175, 80, 0.92)',
  Medium: 'rgba(255, 167, 38, 0.92)',
  Hard: 'rgba(249, 97, 103, 0.92)',
};

function StarRating({ rating, total }: { rating: number; total: number }) {
  const safeRating = rating ?? 0;
  if (!total) return <Text style={styles.noRating}>New</Text>;
  return (
    <View style={styles.starRow}>
      <Text style={styles.stars}>★</Text>
      <Text style={styles.starCount}>
        {safeRating.toFixed(1)} <Text style={styles.starCountDim}>({total})</Text>
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
  const dispatch = useDispatch();
  const isFav = useSelector((s: RootState) => s.favorites.ids.includes(recipe.id));
  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  // Image source preference: remote URL from DB → bundled local asset → cuisine emoji fallback
  const remoteUrl = recipe.image_url && /^https?:\/\//i.test(recipe.image_url) ? recipe.image_url : null;
  const localImage = getRecipeImage(recipe.name);
  const imageSource = remoteUrl ? { uri: remoteUrl } : localImage ?? null;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Image */}
      <View style={[styles.imageWrapper, compact && styles.imageWrapperCompact]}>
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
          <View style={[styles.imageFallback, { backgroundColor: CUISINE_BG[recipe.cuisine_type] ?? '#F0F0F0' }]}>
            <Text style={styles.cuisineEmoji}>{CUISINE_EMOJI[recipe.cuisine_type] ?? '🍽️'}</Text>
          </View>
        )}

        {/* Subtle gradient overlay along bottom for legibility (using a dimmed view) */}
        <View style={styles.imageOverlay} pointerEvents="none" />

        {/* Difficulty pill (bottom-left over image) */}
        <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_BG[recipe.difficulty] ?? 'rgba(0,0,0,0.55)' }]}>
          <Text style={styles.diffText}>{recipe.difficulty || 'Easy'}</Text>
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
        <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
          {recipe.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.cuisineEmojiSmall}>{CUISINE_EMOJI[recipe.cuisine_type] ?? '🍽️'}</Text>
          <Text style={styles.cuisine} numberOfLines={1}>
            {recipe.cuisine_type}
          </Text>
        </View>

        {/* Nutrition grid — full-width cards only */}
        {nutrition && !compact ? (
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
        ) : null}

        <StarRating rating={recipe.average_rating ?? 0} total={recipe.total_ratings ?? 0} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#1f1f1f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  cardCompact: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 18,
  },
  imageWrapper: {
    height: 180,
    position: 'relative',
    backgroundColor: '#F0F0F0',
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
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    borderRadius: 14,
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  heartBtnActive: {
    backgroundColor: '#FF3B5C',
    borderColor: '#FF3B5C',
    shadowColor: '#FF3B5C',
    shadowOpacity: 0.45,
  },
  heartIcon: {
    fontSize: 19,
    color: '#FF3B5C',
    fontWeight: '900',
    lineHeight: 22,
  },
  heartIconActive: {
    color: '#FFFFFF',
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
    borderRadius: 12,
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
    color: '#F9A825',
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
