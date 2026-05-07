import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { shoppingService } from '../services/shoppingService';
import { colors } from '../theme/colors';
import type { RootState } from '../store';
import type { ShoppingList, ShoppingItem } from '../types';

// ─── Smart Grocery Consolidation ─────────────────────────────────────────────

const AISLE_MAP: Record<string, string> = {
  // produce
  tomato: 'Produce', lettuce: 'Produce', onion: 'Produce', garlic: 'Produce',
  carrot: 'Produce', potato: 'Produce', spinach: 'Produce', pepper: 'Produce',
  lemon: 'Produce', lime: 'Produce', ginger: 'Produce', coriander: 'Produce',
  // protein
  chicken: 'Meat & Seafood', beef: 'Meat & Seafood', pork: 'Meat & Seafood',
  fish: 'Meat & Seafood', shrimp: 'Meat & Seafood', egg: 'Dairy & Eggs',
  // dairy
  milk: 'Dairy & Eggs', butter: 'Dairy & Eggs', cheese: 'Dairy & Eggs',
  cream: 'Dairy & Eggs', yogurt: 'Dairy & Eggs',
  // grains
  rice: 'Grains & Pasta', pasta: 'Grains & Pasta', flour: 'Grains & Pasta',
  bread: 'Grains & Pasta', noodle: 'Grains & Pasta',
  // canned
  sauce: 'Canned & Jarred', tomato_paste: 'Canned & Jarred', bean: 'Canned & Jarred',
  stock: 'Canned & Jarred', broth: 'Canned & Jarred',
  // spices
  salt: 'Spices & Condiments', pepper_spice: 'Spices & Condiments', cumin: 'Spices & Condiments',
  turmeric: 'Spices & Condiments', paprika: 'Spices & Condiments', oil: 'Spices & Condiments',
  vinegar: 'Spices & Condiments', soy: 'Spices & Condiments',
};

function getAisle(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, aisle] of Object.entries(AISLE_MAP)) {
    if (lower.includes(key)) return aisle;
  }
  return 'Other';
}

interface ConsolidatedItem {
  name: string;
  quantities: Array<{ qty: number; unit: string }>;
  aisle: string;
  checked: boolean;
  ids: string[];
}

function consolidateItems(items: ShoppingItem[]): Record<string, ConsolidatedItem[]> {
  const map = new Map<string, ConsolidatedItem>();
  for (const item of items) {
    const key = item.ingredient_name.toLowerCase().trim();
    if (map.has(key)) {
      const existing = map.get(key)!;
      const qEntry = existing.quantities.find((q) => q.unit === item.unit);
      if (qEntry) qEntry.qty += item.quantity;
      else existing.quantities.push({ qty: item.quantity, unit: item.unit });
      if (!item.is_checked) existing.checked = false;
      existing.ids.push(item.id);
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
  for (const item of map.values()) {
    const aisle = item.aisle;
    if (!grouped[aisle]) grouped[aisle] = [];
    grouped[aisle].push(item);
  }
  return grouped;
}

function buildInstacartUrl(items: ShoppingItem[]): string {
  const ingNames = [...new Set(items.map((i) => i.ingredient_name))].slice(0, 20);
  const query = ingNames.join(', ');
  return `https://www.instacart.com/store/publix/search_v3/${encodeURIComponent(query)}`;
}

// ─── List detail modal (inline expanded list) ─────────────────────────────────

interface ListDetailProps {
  list: ShoppingList;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function ListDetailView({ list, onClose, onDelete }: ListDetailProps) {
  const qc = useQueryClient();
  const [showConsolidated, setShowConsolidated] = useState(false);
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
      onClose();
    },
  });

  const items = data?.items ?? [];
  const checkedCount = items.filter((i) => i.is_checked).length;
  const consolidated = useMemo(() => consolidateItems(items), [items]);
  const instacartUrl = useMemo(() => buildInstacartUrl(items), [items]);

  function renderItem({ item }: { item: ShoppingItem }) {
    return (
      <TouchableOpacity
        style={detailStyles.row}
        onPress={() => checkMutation.mutate({ itemId: item.id, checked: !item.is_checked })}
      >
        <View style={[detailStyles.checkbox, item.is_checked && detailStyles.checkboxChecked]}>
          {item.is_checked && <Text style={detailStyles.checkmark}>✓</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[detailStyles.itemName, item.is_checked && detailStyles.strikethrough]}>
            {item.ingredient_name}
          </Text>
          <Text style={detailStyles.itemQty}>
            {item.quantity} {item.unit}
            {item.aisle ? ` · ${item.aisle}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={detailStyles.container}>
      {/* Detail header */}
      <View style={detailStyles.header}>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={detailStyles.backText}>← Lists</Text>
        </TouchableOpacity>
        <Text style={detailStyles.title} numberOfLines={1}>{list.name}</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Delete List', 'Remove this shopping list?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => { onDelete(list.id); onClose(); } },
            ])
          }
        >
          <Text style={detailStyles.deleteText}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* Instacart + Consolidate buttons */}
      {items.length > 0 && (
        <View style={detailStyles.actionRow}>
          <TouchableOpacity
            style={[detailStyles.actionBtn, detailStyles.instacartBtn]}
            onPress={() => {
              Alert.alert(
                '🛒 Open in Instacart',
                'This will open Instacart with your ingredients. You can add them to your cart there.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open Instacart', onPress: () => Linking.openURL(instacartUrl) },
                ],
              );
            }}
          >
            <Text style={detailStyles.instacartBtnText}>🛒 Order via Instacart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[detailStyles.actionBtn, showConsolidated && detailStyles.consolidatedBtnActive]}
            onPress={() => setShowConsolidated((v) => !v)}
          >
            <Text style={[detailStyles.consolidatedBtnText, showConsolidated && { color: '#fff' }]}>
              {showConsolidated ? '📋 Standard' : '✨ Smart View'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress bar */}
      {items.length > 0 && (
        <View style={detailStyles.progressSection}>
          <View style={detailStyles.progressTrack}>
            <View style={[detailStyles.progressFill, { width: `${(checkedCount / items.length) * 100}%` }]} />
          </View>
          <Text style={detailStyles.progressText}>{checkedCount}/{items.length} items</Text>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.primary} />
      ) : showConsolidated ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {Object.entries(consolidated).map(([aisle, aisleItems]) => (
            <View key={aisle}>
              <View style={detailStyles.aisleHeader}>
                <Text style={detailStyles.aisleTitle}>{aisle}</Text>
              </View>
              {aisleItems.map((item) => (
                <View key={item.name} style={[detailStyles.row, item.checked && { opacity: 0.5 }]}>
                  <View style={[detailStyles.checkbox, item.checked && detailStyles.checkboxChecked]}>
                    {item.checked && <Text style={detailStyles.checkmark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[detailStyles.itemName, item.checked && detailStyles.strikethrough]}>{item.name}</Text>
                    <Text style={detailStyles.itemQty}>
                      {item.quantities.map((q) => `${q.qty} ${q.unit}`).join(' + ')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
          {items.length === 0 && (
            <View style={detailStyles.empty}><Text style={detailStyles.emptyText}>No items in this list.</Text></View>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={detailStyles.empty}>
              <Text style={detailStyles.emptyText}>No items in this list.</Text>
            </View>
          }
        />
      )}

      {/* Complete button */}
      {list.status === 'active' && items.length > 0 && (
        <View style={detailStyles.completeBar}>
          <TouchableOpacity
            style={[detailStyles.completeBtn, checkedCount < items.length && detailStyles.completeBtnPartial]}
            onPress={() =>
              Alert.alert(
                'Mark Complete?',
                checkedCount < items.length ? `Only ${checkedCount}/${items.length} items checked. Mark done anyway?` : 'Mark this list as complete?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Complete', onPress: () => completeMutation.mutate() },
                ],
              )
            }
          >
            {completeMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={detailStyles.completeBtnText}>Mark Complete ✓</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: 8 },
  actionRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  instacartBtn: { backgroundColor: '#F0FFF4', borderColor: '#38A169' },
  instacartBtnText: { fontSize: 13, fontWeight: '700', color: '#38A169' },
  consolidatedBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  consolidatedBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  aisleHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  aisleTitle: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  backText: { fontSize: 15, color: colors.primary, fontWeight: '600', width: 64 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },
  deleteText: { fontSize: 18, width: 32, textAlign: 'right' },
  progressSection: { paddingHorizontal: 20, paddingVertical: 12 },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 3 },
  progressText: { fontSize: 12, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  itemName: { fontSize: 16, color: colors.text, fontWeight: '500' },
  strikethrough: { textDecorationLine: 'line-through', color: colors.textLight },
  itemQty: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
  completeBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.divider },
  completeBtn: { backgroundColor: colors.success, borderRadius: 24, paddingVertical: 16, alignItems: 'center' },
  completeBtnPartial: { backgroundColor: colors.warning },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

// ─── Shopping list card ───────────────────────────────────────────────────────

function ListCard({ list, onPress }: { list: ShoppingList; onPress: () => void }) {
  const isActive = list.status === 'active';
  const date = new Date(list.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={cardStyles.left}>
        <View style={[cardStyles.badge, isActive ? cardStyles.badgeActive : cardStyles.badgeDone]}>
          <Text style={[cardStyles.badgeText, isActive ? cardStyles.badgeTextActive : cardStyles.badgeTextDone]}>
            {isActive ? 'Active' : 'Done'}
          </Text>
        </View>
        <Text style={cardStyles.name} numberOfLines={2}>{list.name}</Text>
        <Text style={cardStyles.meta}>{list.recipe_ids.length} recipe{list.recipe_ids.length !== 1 ? 's' : ''} · {date}</Text>
      </View>
      <Text style={cardStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceElevated, borderRadius: 16, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, borderWidth: 1, borderColor: colors.divider },
  left: { flex: 1 },
  badge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  badgeActive: { backgroundColor: colors.primaryLight },
  badgeDone: { backgroundColor: '#E8F5E9' },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeTextActive: { color: colors.primary },
  badgeTextDone: { color: colors.success },
  name: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  meta: { fontSize: 13, color: colors.textSecondary },
  arrow: { fontSize: 22, color: colors.textLight, marginLeft: 8 },
});

// ─── ShoppingListScreen ───────────────────────────────────────────────────────

export function ShoppingListScreen(): React.JSX.Element {
  const user = useSelector((s: RootState) => s.auth.user);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const qc = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['shopping-lists', user?.id],
    // Identity comes from the JWT — no userId in path
    queryFn: () => shoppingService.getLists(),
    enabled: !!user?.id,
  });

  // Refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) refetch();
    }, [user?.id, refetch]),
  );

  const deleteMutation = useMutation({
    mutationFn: (listId: string) => shoppingService.deleteList(listId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shopping-lists'] }),
    onError: () => Alert.alert('Error', 'Failed to delete the list. Try again.'),
  });

  // If a list is selected, show detail view
  if (selectedList) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <ListDetailView
          list={selectedList}
          onClose={() => { setSelectedList(null); refetch(); }}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </SafeAreaView>
    );
  }

  const lists = data?.lists ?? [];
  const active = lists.filter((l) => l.status === 'active');
  const completed = lists.filter((l) => l.status === 'completed');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Lists</Text>
        {lists.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{active.length} active</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Couldn't load your lists.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[...active, ...completed]}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <ListCard list={item} onPress={() => setSelectedList(item)} />
          )}
          ListHeaderComponent={
            active.length > 0 && completed.length > 0 ? (
              <Text style={styles.sectionLabel}>Active</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyTitle}>No shopping lists yet</Text>
              <Text style={styles.emptySub}>
                Generate a shopping list from a recipe's detail page to get started.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

export default ShoppingListScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text },
  headerBadge: { backgroundColor: colors.primaryLight, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  headerBadgeText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.error, fontSize: 16, marginBottom: 16 },
  retryBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
