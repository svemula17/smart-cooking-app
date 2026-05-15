import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../store';
import { houseApi } from '../services/api';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button, Sheet, useToast } from '../components/ui';

interface Props {
  visible: boolean;
  scheduleId: string;
  recipeName: string;
  cookName: string;
  onClose: () => void;
  onRated: () => void;
}

const LABELS: Record<number, string> = {
  1: '😞 Poor',
  2: '😕 Okay',
  3: '😊 Good',
  4: '😄 Great',
  5: '🤩 Amazing!',
};

export default function MealRatingSheet({
  visible,
  scheduleId,
  recipeName,
  cookName,
  onClose,
  onRated,
}: Props) {
  const c = useThemeColors();
  const toast = useToast();
  const { house } = useSelector((s: RootState) => s.house);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected || !house) return;
    setLoading(true);
    try {
      await houseApi.post(
        `/houses/${house.id}/schedule/${scheduleId}/ratings`,
        { rating: selected }
      );
      toast.show('Rating saved', 'success');
      onRated();
      onClose();
    } catch (e: any) {
      toast.show(e?.response?.data?.error?.message ?? 'Could not submit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="How was dinner?" height={420}>
      <Text
        style={[
          typography.body,
          { color: c.textSecondary, textAlign: 'center', marginBottom: spacing['2xl'] },
        ]}
      >
        {cookName.split(' ')[0]} made {recipeName}
      </Text>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <View
            key={star}
            style={[
              styles.starBtn,
              {
                backgroundColor:
                  selected === star ? c.primaryMuted : c.surfaceMuted,
              },
            ]}
          >
            <Text
              accessibilityRole="button"
              accessibilityLabel={`${star} stars`}
              onPress={() => setSelected(star)}
              style={{ fontSize: 28 }}
            >
              {star <= (selected ?? 0) ? '⭐' : '☆'}
            </Text>
          </View>
        ))}
      </View>

      {selected ? (
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: c.primary,
            textAlign: 'center',
            marginTop: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          {LABELS[selected]}
        </Text>
      ) : (
        <View style={{ height: spacing.lg }} />
      )}

      <Button
        label="Submit rating"
        size="lg"
        fullWidth
        loading={loading}
        disabled={!selected}
        onPress={handleSubmit}
        hapticStyle="medium"
      />
      <Button
        label="Skip"
        variant="ghost"
        fullWidth
        onPress={onClose}
        style={{ marginTop: spacing.xs }}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  starsRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  starBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
