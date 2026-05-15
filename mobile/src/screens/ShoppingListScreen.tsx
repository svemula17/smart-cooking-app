import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { shoppingService } from '../services/shoppingService';
import type { RootState } from '../store';
import type { ShoppingItem, ShoppingList } from '../types';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { radii } from '../theme/radii';
import { typography } from '../theme/typography';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Header,
  IconButton,
  ListRowSkeleton,
  useHaptics,
  useToast,
} from '../components/ui';

// ── Aisle mapping ─────────────────────────────────────────────────────────

const AISLE_MAP: Record<string, string> = {
  tomato: 'Produce', lettuce: 'Produce', onion: 'Produce', garlic: 'Produce',
  carrot: 'Produce', potato: 'Produce', spinach: 'Produce', pepper: 'Produce',
  lemon: 'Produce', lime: 'Produce', ginger: 'Produce', coriander: 'Produce',
  chicken: 'Meat & Seafood', beef: 'Meat & Seafood', pork: 'Meat & Seafood',
  fish: 'Meat & Seafood', shrimp: 'Meat & Seafood', egg: 'Dairy & Eggs',
  milk: 'Dairy & Eggs', butter: 'Dairy & Eggs', cheese: 'Dairy & Eggs',
  cream: 'Dairy & Eggs', yogurt: 'Dairy & Eggs',
  rice: 'Grains & Pasta', pasta: 'Grains & Pasta', flour: 'Grains & Pasta',
  bread: 'Grains & Pasta', noodle: 'Grains & Pasta',
  sauce: 'Canned & Jarred', tomato_paste: 'Canned & Jarred', bean: 'Canned & Jarred',
  stock: 'Canned & Jarred', broth: 'Canned & Jarred',
  salt: 'Spices & Condiments', cumin: 'Spices & Condiments', turmeric: 'Spices & Condiments',
  paprika: 'Spices & Condiments', oil: 'Spices & Condiments', vinegar: 'Spices & Condiments',
  soy: 'Spices & Condiments',
};

const getAisle = (name: string): string => {
  const lower = name.toLowerCase();
  for (const [k, aisle] of Object.entries(AISLE_MAP)) if (lower.includes(k)) return aisle;
  return 'Other';
};

interface ConsolidatedItem {
  name: string;
  quantities: Array<{ qty: number; unit: string }>;
  aisle: string;
  checked: boolean;
  ids: string[];
}

const consolidateItems = (items: ShoppingItem[]): Record<string, ConsolidatedItem[]> => {
  const map = new Map<string, ConsolidatedItem>();
  for (const item of items) {
    const key = item.ingredient_name.toLowerCase().trim();
    if (map.has(key)) {
      const ex = map.get(key)!;
      const q = ex.quantities.find((x) => x.unit === item.unit);
      if (q) q.qty += item.quantity;
      else ex.quantities.push({ qty: item.quantity, unit: item.unit });
      if (!item.is_checked) ex.checked = false;
      ex.ids.push(item.id);
    } else {
      map.set(key, {
        name: item.ingredient_name,
        quantities: [{ qty: item.quantity, unit: item.unit }],
        aisle: item.aisle ?? getAisle(item.ingredient_name),
        checked: item.is_checked,
        ids: [item.id],
      });
    }
  }
  const grouped: Record<string, ConsolidatedItem[]> = {};
  for (const it of map.values()) {
    if (!grouped[it.aisle]) grouped[it.aisle] = [];
    grouped[it.aisle].push(it);
  }
  return grouped;
};

const buildInstacartUrl = (items: ShoppingItem[]): string => {
  const ingNames = [...new Set(items.map((i) => i.ingredient_name))].slice(0, 20);
  return `https://www.instacart.com/store/publix/search_v3/${encodeURIComponent(ingNames.join(', '))}`;
};

// ── Item row ──────────────────────────────────────────────────────────────

function ItemRow({
  name,
  qty,
  checked,
  onToggle,
}: {
  name: string;
  qty: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const c = useThemeColors();
  const haptics = useHaptics();
  return (
    <Card
      onPress={() => {
        haptics.selection();
        onToggle();
      }}
      surface="surface"
      radius="md"
      padding="md"
      elevation="flat"
      bordered
      style={{ marginBottom: spacing.sm, opacity: checked ? 0.55 : 1 }}
      accessibilityLabel={`${name}, ${checked ? 'checked' : 'unchecked'}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: checked ? c.success : 'transparent',
              borderColor: checked ? c.success : c.borderStrong,
            },
          ]}
        >
          {checked ? <Text style={{ color: c.onPrimary, fontWeight: '800' }}>✓</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              typography.body,
              {
                color: c.text,
                fontWeight: '600',
                textDecorationLine: checked ? 'line-through' : 'none',
              },
            ]}
          >
            {name}
          </Text>
          <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
            {qty}
          </Text>
        </View>
      </View>
    </Card>
  );
}

// ── List detail ───────────────────────────────────────────────────────────

function ListDetailView({
  list,
  onClose,
  onDelete,
}: {
  list: ShoppingList;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const c = useThemeColors();
  const toast = useToast();
  const qc = useQueryClient();
  const [showSmart, setShowSmart] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['shopping-detail', list.id],
    queryFn: () => shoppingService.getList(list.id),
  });

  const checkMutation = useMutation({
    mutationFn: ({ itemId, checked }: { itemId: string; checked: boolean }) =>
      shoppingService.checkItem(list.id, itemId, checked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping-detail', list.id] }),
  });

  const completeMutation = useMutation({
    mutationFn: () => shoppingService.completeList(list.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shopping-lists'] });
      toast.show('List complete', 'success');
      onClose();
    },
  });

  const items = data?.items ?? [];
  const checkedCount = items.filter((i) => i.is_checked).length;
  const consolidated = useMemo(() => consolidateItems(items), [items]);
  const instacartUrl = useMemo(() => buildInstacartUrl(items), [items]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <Header
        title={list.name}
        onBack={onClose}
        right={
          <IconButton
            icon="🗑"
            size={36}
            accessibilityLabel="Delete list"
            onPress={() =>
              Alert.alert('Delete list', 'Remove this shopping list?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    onDelete(list.id);
                    onClose();
                  },
                },
              ])
            }
          />
        }
        border
      />

      {items.length > 0 ? (
        <View style={styles.actionRow}>
          <Button
            label="🛒 Instacart"
            variant="secondary"
            onPress={() =>
              Alert.alert('Open Instacart?', 'This opens Instacart with these ingredients.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open', onPress: () => Linking.openURL(instacartUrl) },
              ])
            }
            style={{ flex: 1 }}
          />
          <Chip
            label={showSmart ? '✨ Smart' : '📋 Plain'}
            selected={showSmart}
            onPress={() => setShowSmart((v) => !v)}
          />
        </View>
      ) : null}

      {items.length > 0 ? (
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: c.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(checkedCount / items.length) * 100}%`,
                  backgroundColor: c.success,
                },
              ]}
            />
          </View>
          <Text style={[typography.caption, { color: c.textSecondary, marginTop: spacing.xs }]}>
            {checkedCount}/{items.length} items
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: spacing.lg }}>
          <ListRowSkeleton />
          <ListRowSkeleton />
          <ListRowSkeleton />
        </View>
      ) : showSmart ? (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(consolidated).map(([aisle, aisleItems]) => (
            <View key={aisle} style={{ marginTop: spacing.lg }}>
              <Text style={[typography.overline, { color: c.textSecondary, marginBottom: spacing.sm }]}>
                {aisle}
              </Text>
              {aisleItems.map((item) => (
                <ItemRow
                  key={item.name}
                  name={item.name}
                  qty={item.quantities.map((q) => `${q.qty} ${q.unit}`).join(' + ')}
                  checked={item.checked}
                  onToggle={() => {
                    item.ids.forEach((id) =>
                      checkMutation.mutate({ itemId: id, checked: !item.checked })
                    );
                  }}
                />
              ))}
            </View>
          ))}
          {items.length === 0 ? (
            <EmptyState icon="🛒" title="Empty list" body="Add items to get started." />
          ) : null}
        </ScrollView>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <ItemRow
              name={item.ingredient_name}
              qty={`${item.quantity} ${item.unit}${item.aisle ? ` · ${item.aisle}` : ''}`}
              checked={item.is_checked}
              onToggle={() =>
                checkMutation.mutate({ itemId: item.id, checked: !item.is_checked })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState icon="🛒" title="Empty list" body="Add items to get started." />
          }
        />
      )}

      {list.status === 'active' && items.length > 0 ? (
        <View style={[styles.completeBar, { backgroundColor: c.background, borderTopColor: c.border }]}>
          <Button
            label="Mark complete ✓"
            variant={checkedCount === items.length ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            loading={completeMutation.isPending}
            onPress={() =>
              Alert.alert(
                'Mark complete?',
                checkedCount < items.length
                  ? `Only ${checkedCount}/${items.length} items checked. Mark done anyway?`
                  : 'Mark this list as complete?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Complete', onPress: () => completeMutation.mutate() },
                ]
              )
            }
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// ── List card ─────────────────────────────────────────────────────────────

function ListCard({ list, onPress }: { list: ShoppingList; onPress: () => void }) {
  const c = useThemeColors();
  const isActive = list.status === 'active';
  const date = new Date(list.created_at).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
  return (
    <Card
      onPress={onPress}
      surface="surface"
      radius="xl"
      padding="lg"
      elevation="card"
      bordered
      style={{ marginBottom: spacing.md }}
      accessibilityLabel={`${list.name}, ${isActive ? 'active' : 'completed'}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Badge label={isActive ? 'Active' : 'Done'} tone={isActive ? 'primary' : 'success'} />
          <Text style={[typography.h3, { color: c.text }]} numberOfLines={2}>
            {list.name}
          </Text>
          <Text style={[typography.caption, { color: c.textSecondary }]}>
            {list.recipe_ids.length} recipe{list.recipe_ids.length !== 1 ? 's' : ''} · {date}
          </Text>
        </View>
        <Text style={{ fontSize: 22, color: c.textLight }}>›</Text>
      </View>
    </Card>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────

export function ShoppingListScreen(): React.JSX.Element {
  const c = useThemeColors();
  const user = useSelector((s: RootState) => s.auth.user);
  const house = useSelector((s: RootState) => s.house.house);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [houseMode, setHouseMode] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['shopping-lists', user?.id],
    queryFn: () => shoppingService.getLists(),
    enabled: !!user?.id,
  });

  useFocusEffect(
    useCallback(() => {
      if (user?.id) refetch();
    }, [user?.id, refetch])
  );

  const deleteMutation = useMutation({
    mutationFn: (listId: string) => shoppingService.deleteList(listId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping-lists'] }),
  });

  if (selectedList) {
    return (
      <ListDetailView
        list={selectedList}
        onClose={() => {
          setSelectedList(null);
          refetch();
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    );
  }

  const lists = data?.lists ?? [];
  const active = lists.filter((l) => l.status === 'active');
  const completed = lists.filter((l) => l.status === 'completed');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h1, { color: c.text }]}>
            {houseMode ? 'House lists' : 'Shopping lists'}
          </Text>
          {lists.length > 0 ? (
            <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
              {active.length} active · {completed.length} done
            </Text>
          ) : null}
        </View>
        {house ? (
          <Chip
            label={houseMode ? '🏠 House' : '👤 Personal'}
            selected={houseMode}
            onPress={() => setHouseMode((v) => !v)}
          />
        ) : null}
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          <ListRowSkeleton />
          <ListRowSkeleton />
        </View>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={[...active, ...completed]}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={c.primary}
            />
          }
          renderItem={({ item }) => (
            <ListCard list={item} onPress={() => setSelectedList(item)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="🛒"
              title="No shopping lists yet"
              body="Generate a list from a recipe to get started."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

export default ShoppingListScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['2xl'] },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  progressSection: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
