import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedStatusBar } from '../components/ThemedStatusBar';
import { Button, Card, Header, Icon, type IconName } from '../components/ui';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { RootState, setTapSound, setTapHaptic } from '../store';
import {
  TAP_SOUNDS,
  TAP_HAPTICS,
  playSound,
  triggerHaptic,
  previewFeedback,
} from '../utils/feedback';

interface RowProps {
  label: string;
  icon: IconName;
  selected: boolean;
  divider: boolean;
  onPress: () => void;
}

function OptionRow({ label, icon, selected, divider, onPress }: RowProps) {
  const c = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
        pressed && { backgroundColor: c.surfaceMuted },
      ]}
    >
      <Icon name={icon} size={18} color={c.textSecondary} />
      <Text style={[typography.body, { color: c.text, flex: 1, fontWeight: '600' }]}>{label}</Text>
      {selected ? (
        <Icon name="check" size={20} color={c.primary} />
      ) : (
        <Text style={[typography.caption, { color: c.textLight }]}>Tap to try</Text>
      )}
    </Pressable>
  );
}

export default function TapFeedbackScreen(): React.JSX.Element {
  const c = useThemeColors();
  const nav = useNavigation<any>();
  const dispatch = useDispatch();
  const tapSound = useSelector((s: RootState) => s.settings.tapSound);
  const tapHaptic = useSelector((s: RootState) => s.settings.tapHaptic);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ThemedStatusBar />
      <Header title="Tap feedback" onBack={() => nav.goBack()} border />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[typography.body, { color: c.textSecondary }]}>
          Pick how every button press feels and sounds. Your choice applies across the whole app —
          tap any option below to preview it.
        </Text>

        {/* Sound */}
        <View>
          <Text style={[typography.overline, { color: c.textSecondary, marginBottom: spacing.sm }]}>
            Sound
          </Text>
          <Card padding="none">
            {TAP_SOUNDS.map((opt, i) => (
              <OptionRow
                key={opt.id}
                label={opt.label}
                icon={opt.id === 'none' ? 'volume-x' : 'volume-2'}
                selected={tapSound === opt.id}
                divider={i > 0}
                onPress={() => {
                  dispatch(setTapSound(opt.id));
                  playSound(opt.id);
                }}
              />
            ))}
          </Card>
        </View>

        {/* Haptic */}
        <View>
          <Text style={[typography.overline, { color: c.textSecondary, marginBottom: spacing.sm }]}>
            Haptic (needs a real device)
          </Text>
          <Card padding="none">
            {TAP_HAPTICS.map((opt, i) => (
              <OptionRow
                key={opt.id}
                label={opt.label}
                icon="smartphone"
                selected={tapHaptic === opt.id}
                divider={i > 0}
                onPress={() => {
                  dispatch(setTapHaptic(opt.id));
                  triggerHaptic(opt.id);
                }}
              />
            ))}
          </Card>
        </View>

        <Button
          label="Try current feel"
          fullWidth
          size="lg"
          onPress={() => previewFeedback(tapSound, tapHaptic)}
        />
        <Text style={[typography.caption, { color: c.textLight, textAlign: 'center' }]}>
          Tip: tap sounds play even on silent. Set Sound to “Silent” for haptic-only.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
