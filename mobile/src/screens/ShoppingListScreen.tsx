// ShoppingListScreen — the middle of the meal-plan → shop → pantry flow.
//
// Arrives here from MealPlanner ("Shopping list"), which generates a list
// from the week's planned recipes. Items come pre-aggregated and grouped by
// grocery aisle. The user checks things off as they shop; "Add to pantry"
// pushes every checked item into the pantry and marks the list complete.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppNavigation, AppRoute } from '../types';
import { ThemedStatusBar } from '../components/ThemedStatusBar';
import * as shoppingService from '../services/shoppingService';
import type { ShoppingItem } from '../services/shoppingService';
import { pantryService } from '../services/pantryService';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button, Header, EmptyState, Skeleton, useToast } from '../components/ui';

export default function ShoppingListScreen({
  route,
  navigation,
}: {
  route: AppRoute<'ShoppingList'>;
  navigation: AppNavigation;
}) {
  const { listId } = route.params;
  const c = useThemeColors();
  const toast = useToast();

  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [listName, setListName] = useState('Shopping list');
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await shoppingService.getList(listId);
      setItems(list.items ?? []);
      setListName(list.name ?? 'Shopping list');
    } catch {
      toast.show('Could not load list', 'error');
    } finally {
      setLoading(false);
    }
  }, [listId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const checkedCount = items.filter((i) => i.is_checked).length;
  const allChecked = items.length > 0 && checkedCount === items.length;

  // Optimistic toggle; persist in the background.
  const toggle = (item: ShoppingItem) => {
    const next = !item.is_checked;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_checked: next } : i)));
    shoppingService.checkItem(listId, item.id, next).catch(() => {
      // revert on failure
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_checked: !next } : i)));
      toast.show('Could not update item', 'error');
    });
  };

  const toggleAll = () => {
    const next = !allChecked;
    setItems((prev) => prev.map((i) => ({ ...i, is_checked: next })));
    // Persist each changed item (fire-and-forget).
    items.forEach((i) => {
      if (i.is_checked !== next) shoppingService.checkItem(listId, i.id, next).catch(() => {});
    });
  };

  // Group checked-aware items by aisle for a tidy store walk.
  const sections = useMemo(() => {
    const byAisle = new Map<string, ShoppingItem[]>();
    for (const it of items) {
      const key = it.aisle ?? 'Other';
      if (!byAisle.has(key)) byAisle.set(key, []);
      byAisle.get(key)!.push(it);
    }
    return Array.from(byAisle.entries()).map(([title, data]) => ({ title, data }));
  }, [items]);

  const handleFinish = async () => {
    const bought = items.filter((i) => i.is_checked);
    if (bought.length === 0) {
      toast.show('Check off what you bought first', 'warning');
      return;
    }
    setFinishing(true);
    try {
      // Push every bought item into the pantry.
      await Promise.all(
        bought.map((i) =>
          pantryService.create({
            name: i.ingredient_name,
            quantity: i.quantity ?? 1,
            unit: i.unit ?? 'units',
            category: i.aisle ?? 'other',
            location: 'pantry',
            expiry_date: null,
          }),
        ),
      );
      await shoppingService.completeList(listId).catch(() => {}); // best-effort
      toast.show(`Added ${bought.length} item${bought.length > 1 ? 's' : ''} to pantry`, 'success');
      navigation.navigate('Pantry');
    } catch {
      toast.show('Could not add to pantry', 'error');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ThemedStatusBar />
      <Header
        title={listName}
        onBack={() => navigation.goBack()}
        right={
          items.length > 0 ? (
            <TouchableOpacity onPress={toggleAll} accessibilityRole="button">
              <Text style={[typography.button, { color: c.primary }]}>
                {allChecked ? 'Clear' : 'All'}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        border
      />

      {loading ? (
        <View style={{ padding: spacing.lg, gap: spacing.sm }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={52} radius={12} />
          ))}
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="No items"
          body="This list is empty. Plan some meals and tap “Shopping list”."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text
              style={[
                typography.label,
                { color: c.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs, fontWeight: '700' },
              ]}
            >
              {section.title.toUpperCase()}
            </Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => toggle(item)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.is_checked }}
            >
              <View
                style={[
                  styles.check,
                  {
                    borderColor: item.is_checked ? c.primary : c.border,
                    backgroundColor: item.is_checked ? c.primary : 'transparent',
                  },
                ]}
              >
                {item.is_checked ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
              <Text
                style={[
                  typography.body,
                  {
                    flex: 1,
                    color: item.is_checked ? c.textLight : c.text,
                    textDecorationLine: item.is_checked ? 'line-through' : 'none',
                  },
                ]}
              >
                {item.ingredient_name}
              </Text>
              {item.quantity ? (
                <Text style={[typography.bodySmall, { color: c.textSecondary }]}>
                  {item.quantity} {item.unit ?? ''}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}

      {!loading && items.length > 0 ? (
        <View style={[styles.footer, { backgroundColor: c.background, borderTopColor: c.border }]}>
          <Button
            label={
              checkedCount > 0
                ? `Add ${checkedCount} to pantry →`
                : 'Check off what you bought'
            }
            onPress={handleFinish}
            loading={finishing}
            disabled={checkedCount === 0}
            fullWidth
            size="lg"
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 15, fontWeight: '800' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
