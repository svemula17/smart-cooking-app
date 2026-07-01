import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Badge, Icon, IconButton } from '../ui';
import { DietDot } from '../DietDot';
import { useThemeColors } from '../../theme/useThemeColors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { RecipeWithDetails } from '../../types';

const CUISINE_EMOJI: Record<string, string> = {
  Indian: '🍛', Chinese: '🥢', Italian: '🍝', Mexican: '🌮',
  Thai: '🍜', Japanese: '🍱', Mediterranean: '🫒', American: '🍔',
  French: '🥐', 'Indo-Chinese': '🍜',
};

function stars(rating: number): string {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

interface RecipeHeroProps {
  recipe: RecipeWithDetails;
  isFav: boolean;
  onBack: () => void;
  onToggleFav: () => void;
}

/**
 * Top of the RecipeDetail screen: full-bleed image with a darkening scrim,
 * back + favorite buttons floating on top, and a white "card" along the
 * bottom containing the difficulty/cuisine badges, recipe name, and star
 * rating. Extracted from RecipeDetailScreen.tsx — keeps the screen file
 * focused on data + tabs.
 */
export function RecipeHero({ recipe, isFav, onBack, onToggleFav }: RecipeHeroProps): React.JSX.Element {
  const c = useThemeColors();
  const cuisineEmoji = CUISINE_EMOJI[recipe.cuisine_type] ?? '🍽️';
  const hasImage = recipe.image_url && /^https?:\/\//.test(recipe.image_url);

  return (
    <View style={[styles.hero, { backgroundColor: c.primaryMuted }]}>
      {hasImage ? (
        <Image
          source={{ uri: recipe.image_url! }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
      ) : (
        <Text style={styles.heroBg}>{cuisineEmoji}</Text>
      )}
      <View style={styles.heroScrim} pointerEvents="none" />

      <View style={styles.heroOverlayBtns}>
        <IconButton
          icon={<Icon name="chevron-left" size={24} />}
          size={40}
          variant="tinted"
          accessibilityLabel="Go back"
          onPress={onBack}
        />
        <IconButton
          icon={isFav ? '❤️' : '🤍'}
          size={40}
          variant="tinted"
          accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
          onPress={onToggleFav}
        />
      </View>

      <View
        style={[
          styles.heroBottom,
          { backgroundColor: 'rgba(255,255,255,0.94)' },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
          {recipe.diet ? <DietDot diet={recipe.diet} size={16} /> : null}
          <Badge
            label={recipe.difficulty}
            tone="neutral"
          />
          <Badge label={recipe.cuisine_type} tone="neutral" />
          {recipe.region ? <Badge label={recipe.region} tone="neutral" /> : null}
        </View>
        <Text style={[typography.h2, { color: c.text }]} numberOfLines={2}>
          {recipe.name}
        </Text>
        <View style={styles.starRow}>
          <Text style={{ fontSize: 14, color: c.text, letterSpacing: 1 }}>
            {stars(recipe.average_rating)}
          </Text>
          <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
            {recipe.average_rating.toFixed(1)} ({recipe.total_ratings})
          </Text>
        </View>
      </View>
    </View>
  );
}

export default RecipeHero;

const styles = StyleSheet.create({
  hero: { height: 280, position: 'relative', overflow: 'hidden' },
  heroBg: {
    position: 'absolute',
    fontSize: 140,
    opacity: 0.22,
    alignSelf: 'center',
    top: 30,
  },
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroOverlayBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  heroBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 6,
  },
});
