import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import type { PantryItem } from '../services/pantryService';
import { RootState } from '../store';
import {
  addPantryItem,
  removePantryItem,
  toggleCookFromPantry,
  updatePantryItem,
} from '../store';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Header,
  IconButton,
  Sheet,
  TextField,
  useToast,
} from '../components/ui';

const CATEGORIES = ['produce', 'dairy', 'meat', 'seafood', 'grains', 'spices', 'canned', 'frozen', 'beverages', 'other'];
const UNITS = ['g', 'kg', 'ml', 'L', 'cups', 'tbsp', 'tsp', 'units', 'oz', 'lb', 'pieces'];
const LOCATIONS = ['pantry', 'fridge', 'freezer', 'spice rack'];

const CATEGORY_EMOJI: Record<string, string> = {
  produce: '🥦',
  dairy: '🥛',
  meat: '🥩',
  seafood: '🐟',
  grains: '🌾',
  spices: '🧂',
  canned: '🥫',
  frozen: '❄️',
  beverages: '🍶',
  other: '📦',
};

const EXPIRY_WARNING_DAYS = 3;

const daysUntilExpiry = (d: string | null): number | null => {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

interface ItemForm {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  location: string;
  expiry_date: string;
}

const EMPTY_FORM: ItemForm = {
  name: '',
  quantity: '1',
  unit: 'units',
  category: 'other',
  location: 'pantry',
  expiry_date: '',
};

export function PantryScreen() {
  const c = useThemeColors();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();

  const cookFromPantry = useSelector((s: RootState) => s.pantry.cookFromPantryMode);
  const items = useSelector((s: RootState) => s.pantry.items);

  const [showSheet, setShowSheet] = useState(false);
  const [editing, setEditing] = useState<PantryItem | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowSheet(true);
  }, []);

  const openEdit = useCallback((item: PantryItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      category: item.category,
      location: item.location,
      expiry_date: item.expiry_date ?? '',
    });
    setShowSheet(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Name is required');
      return;
    }
    const payload = {
      name: form.name.trim(),
      quantity: parseFloat(form.quantity) || 1,
      unit: form.unit,
      category: form.category,
      location: form.location,
      expiry_date: form.expiry_date || null,
    };
    if (editing) {
      dispatch(updatePantryItem({ ...editing, ...payload }));
      toast.show('Updated', 'success');
    } else {
      dispatch(addPantryItem({ id: String(Date.now()), ...payload }));
      toast.show('Added to pantry', 'success');
    }
    setShowSheet(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }, [form, editing, dispatch, toast]);

  const handleDelete = useCallback(
    (item: PantryItem) => {
      Alert.alert('Delete item', `Remove ${item.name} from pantry?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(removePantryItem(item.id));
            toast.show('Removed', 'info');
          },
        },
      ]);
    },
    [dispatch, toast]
  );

  const filtered = items.filter((it) => {
    const matchSearch = !search || it.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCat || it.category === selectedCat;
    return matchSearch && matchCat;
  });

  const expiring = items.filter((it) => {
    const d = daysUntilExpiry(it.expiry_date);
    return d !== null && d <= EXPIRY_WARNING_DAYS && d >= 0;
  });
  const expired = items.filter((it) => {
    const d = daysUntilExpiry(it.expiry_date);
    return d !== null && d < 0;
  });
  const shelfStable = items.filter((it) => !it.expiry_date);
  const freshness =
    items.length === 0
      ? 100
      : Math.max(
          0,
          Math.round(
            ((items.length - expiring.length - expired.length * 1.5) / items.length) * 100
          )
        );

  const grouped = CATEGORIES.reduce<Record<string, PantryItem[]>>((acc, cat) => {
    const sub = filtered.filter((i) => i.category === cat);
    if (sub.length > 0) acc[cat] = sub;
    return acc;
  }, {});

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Pantry"
        onBack={() => navigation.goBack()}
        right={<Button label="+ Add" size="sm" onPress={openAdd} />}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cook from pantry toggle */}
        <Card
          surface="surface"
          radius="xl"
          padding="lg"
          elevation="card"
          style={styles.block}
          bordered
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h4, { color: c.text }]}>Cook From Pantry</Text>
              <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                Filter recipes by available ingredients
              </Text>
            </View>
            <Switch
              value={cookFromPantry}
              onValueChange={() => {
                dispatch(toggleCookFromPantry());
              }}
              trackColor={{ false: c.borderStrong, true: c.primary }}
              accessibilityLabel="Toggle cook from pantry"
            />
          </View>
        </Card>

        {/* Pulse */}
        <Card
          surface="surfaceMuted"
          radius="2xl"
          padding="lg"
          elevation="flat"
          style={styles.block}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[typography.overline, { color: c.textSecondary }]}>Pantry Pulse</Text>
              <Text style={[typography.h3, { color: c.text, marginTop: 2 }]}>
                What your kitchen is telling you
              </Text>
            </View>
            <View
              style={{
                backgroundColor: c.surface,
                borderRadius: 16,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              <Text style={{ fontSize: 22, fontWeight: '900', color: c.accent }}>{freshness}</Text>
            </View>
          </View>
          <Text
            style={[typography.bodySmall, { color: c.textSecondary, marginTop: spacing.sm }]}
          >
            Use soon, restock later, waste less.
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <Stat value={expired.length} label="Expired" tone={expired.length > 0 ? 'error' : 'neutral'} />
            <Stat value={expiring.length} label="Use soon" tone={expiring.length > 0 ? 'warning' : 'neutral'} />
            <Stat value={shelfStable.length} label="Shelf stable" />
          </View>
        </Card>

        {expiring.length > 0 ? (
          <View
            style={[
              styles.expiryBanner,
              { backgroundColor: c.warningMuted, borderColor: c.warning },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14 }}>⚠️</Text>
              <Text style={{ fontSize: 13, color: c.warning, fontWeight: '700', flex: 1 }}>
                {expiring.length} item{expiring.length > 1 ? 's' : ''} expiring soon:{' '}
                {expiring.map((i) => i.name).join(', ')}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={[styles.block, { marginTop: 0 }]}>
          <TextField
            placeholder="Search pantry…"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
            leading={<Text style={{ fontSize: 16 }}>🔍</Text>}
            accessibilityLabel="Search pantry"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          <Chip label="All" selected={!selectedCat} onPress={() => setSelectedCat(null)} />
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={`${CATEGORY_EMOJI[cat]} ${cat}`}
              selected={selectedCat === cat}
              onPress={() => setSelectedCat(selectedCat === cat ? null : cat)}
            />
          ))}
        </ScrollView>

        {Object.entries(grouped).map(([cat, catItems]) => (
          <View key={cat} style={[styles.block, { marginBottom: spacing.lg }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
              <Text style={{ fontSize: 16 }}>{CATEGORY_EMOJI[cat] ?? '📦'}</Text>
              <Text style={[typography.h4, { color: c.text }]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </View>
            {catItems.map((item) => {
              const days = daysUntilExpiry(item.expiry_date);
              const isExpiring = days !== null && days <= EXPIRY_WARNING_DAYS && days >= 0;
              const isExpired = days !== null && days < 0;
              return (
                <Card
                  key={item.id}
                  surface="surface"
                  radius="lg"
                  padding="md"
                  elevation="flat"
                  bordered
                  style={{
                    marginBottom: spacing.sm,
                    borderColor: isExpired ? c.error : isExpiring ? c.warning : c.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.h4, { color: c.text }]}>{item.name}</Text>
                      <Text
                        style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}
                      >
                        {item.quantity} {item.unit} · {item.location}
                        {item.expiry_date
                          ? isExpired
                            ? ' · EXPIRED'
                            : isExpiring
                            ? ` · ${days}d left`
                            : ` · Exp ${item.expiry_date}`
                          : ''}
                      </Text>
                    </View>
                    {isExpired ? (
                      <Badge label="EXPIRED" tone="error" />
                    ) : isExpiring ? (
                      <Badge label="USE SOON" tone="warning" />
                    ) : null}
                    <IconButton
                      icon="✏️"
                      size={36}
                      accessibilityLabel={`Edit ${item.name}`}
                      onPress={() => openEdit(item)}
                    />
                    <IconButton
                      icon="🗑️"
                      size={36}
                      accessibilityLabel={`Delete ${item.name}`}
                      onPress={() => handleDelete(item)}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        ))}

        {filtered.length === 0 ? (
          <EmptyState
            icon="🥡"
            title={search ? 'No matches' : 'Pantry is empty'}
            body={
              search
                ? 'Try a different search term.'
                : 'Add ingredients you have at home to see them tracked.'
            }
            ctaLabel={search ? undefined : '+ Add first item'}
            onCta={search ? undefined : openAdd}
          />
        ) : null}
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      {/* Add/Edit Sheet */}
      <Sheet
        visible={showSheet}
        onClose={() => {
          setShowSheet(false);
          setEditing(null);
          setForm(EMPTY_FORM);
        }}
        title={editing ? 'Edit item' : 'Add to pantry'}
        height={640}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ gap: spacing.md, paddingBottom: spacing['2xl'] }}>
            <TextField
              label="Name"
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="e.g. Chicken breast"
              autoFocus
            />
            <TextField
              label="Quantity"
              value={form.quantity}
              onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))}
              keyboardType="decimal-pad"
              placeholder="1"
            />
            <View>
              <Text style={[typography.label, { color: c.textSecondary, marginBottom: spacing.xs }]}>
                Unit
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {UNITS.map((u) => (
                    <Chip
                      key={u}
                      label={u}
                      size="sm"
                      selected={form.unit === u}
                      onPress={() => setForm((f) => ({ ...f, unit: u }))}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
            <View>
              <Text style={[typography.label, { color: c.textSecondary, marginBottom: spacing.xs }]}>
                Category
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    label={`${CATEGORY_EMOJI[cat]} ${cat}`}
                    size="sm"
                    selected={form.category === cat}
                    onPress={() => setForm((f) => ({ ...f, category: cat }))}
                  />
                ))}
              </View>
            </View>
            <View>
              <Text style={[typography.label, { color: c.textSecondary, marginBottom: spacing.xs }]}>
                Location
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {LOCATIONS.map((l) => (
                  <Chip
                    key={l}
                    label={l}
                    size="sm"
                    selected={form.location === l}
                    onPress={() => setForm((f) => ({ ...f, location: l }))}
                  />
                ))}
              </View>
            </View>
            <TextField
              label="Expiry date (YYYY-MM-DD, optional)"
              value={form.expiry_date}
              onChangeText={(v) => setForm((f) => ({ ...f, expiry_date: v }))}
              placeholder="2026-06-01"
              autoCapitalize="none"
            />
            <Button
              label={editing ? 'Save changes' : 'Add to pantry'}
              onPress={handleSave}
              fullWidth
              size="lg"
              hapticStyle="medium"
              style={{ marginTop: spacing.md }}
            />
          </View>
        </ScrollView>
      </Sheet>
    </SafeAreaView>
  );
}

function Stat({
  value,
  label,
  tone = 'neutral',
}: {
  value: number;
  label: string;
  tone?: 'neutral' | 'warning' | 'error';
}) {
  const c = useThemeColors();
  const color = tone === 'error' ? c.error : tone === 'warning' ? c.warning : c.text;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.surface,
        borderRadius: 14,
        padding: spacing.md,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: '900', color }}>{value}</Text>
      <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2, fontWeight: '600' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  block: { marginHorizontal: spacing.xl, marginTop: spacing.md },
  expiryBanner: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  catScroll: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
});
