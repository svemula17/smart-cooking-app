import React, { useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { Sheet } from './ui';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useHaptics } from './ui/useHaptics';

export interface FilterOption {
  key: string;
  label: string;
}

interface FilterPillProps {
  label: string; // e.g. "Diet" — shown when nothing is selected
  value?: string; // selected option key
  options: FilterOption[];
  onChange: (key: string | undefined) => void;
  /** Optional leading element per option key (e.g. a diet dot). */
  leadingFor?: (key: string) => React.ReactNode;
}

/**
 * A compact dropdown pill: shows the label (or the selected value) + a chevron,
 * and opens a bottom sheet of options on tap. Keeps the Browse filter bar to a
 * single row instead of many stacked chip rows.
 */
export function FilterPill({ label, value, options, onChange, leadingFor }: FilterPillProps) {
  const c = useThemeColors();
  const haptics = useHaptics();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value);
  const active = !!value;

  const sheetHeight = Math.min(options.length * 52 + 150, 480);

  return (
    <>
      <Pressable
        onPress={() => {
          haptics.impact();
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label} filter${selected ? `, ${selected.label}` : ''}`}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: spacing.md,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          marginRight: spacing.sm,
          backgroundColor: active ? c.primary : c.surfaceMuted,
          borderColor: active ? c.primary : c.border,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        {active && leadingFor ? leadingFor(value!) : null}
        <Text style={{ color: active ? c.onPrimary : c.textSecondary, fontWeight: '600', fontSize: 13 }}>
          {selected ? selected.label : label}
        </Text>
        <Text style={{ color: active ? c.onPrimary : c.textLight, fontSize: 10, marginTop: 1 }}>▾</Text>
      </Pressable>

      <Sheet visible={open} onClose={() => setOpen(false)} title={label} height={sheetHeight}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <OptionRow
            label="All"
            selected={!value}
            onPress={() => {
              onChange(undefined);
              setOpen(false);
            }}
          />
          {options.map((o) => (
            <OptionRow
              key={o.key}
              label={o.label}
              leading={leadingFor?.(o.key)}
              selected={o.key === value}
              onPress={() => {
                onChange(o.key);
                setOpen(false);
              }}
            />
          ))}
        </ScrollView>
      </Sheet>
    </>
  );
}

function OptionRow({
  label,
  selected,
  onPress,
  leading,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  leading?: React.ReactNode;
}) {
  const c = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: 14,
        paddingHorizontal: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: c.borderMuted,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {leading}
      <Text style={[typography.body, { color: selected ? c.primary : c.text, fontWeight: selected ? '700' : '500', flex: 1 }]}>
        {label}
      </Text>
      {selected ? <Text style={{ color: c.primary, fontWeight: '800' }}>✓</Text> : null}
    </Pressable>
  );
}
