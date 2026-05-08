import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, Alert, Modal, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { PantryItem } from '../services/pantryService';
import { RootState } from '../store';
import { addPantryItem, updatePantryItem, removePantryItem, toggleCookFromPantry } from '../store';
import { useThemeColors } from '../theme/useThemeColors';

const CATEGORIES = ['produce', 'dairy', 'meat', 'seafood', 'grains', 'spices', 'canned', 'frozen', 'beverages', 'other'];
const UNITS = ['g', 'kg', 'ml', 'L', 'cups', 'tbsp', 'tsp', 'units', 'oz', 'lb', 'pieces'];
const LOCATIONS = ['pantry', 'fridge', 'freezer', 'spice rack'];

const CATEGORY_EMOJI: Record<string, string> = {
  produce: '🥦', dairy: '🥛', meat: '🥩', seafood: '🐟',
  grains: '🌾', spices: '🧂', canned: '🥫', frozen: '❄️',
  beverages: '🍶', other: '📦',
};

const EXPIRY_WARNING_DAYS = 3;

function daysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface ItemFormState {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  location: string;
  expiry_date: string;
}

const EMPTY_FORM: ItemFormState = { name: '', quantity: '1', unit: 'units', category: 'other', location: 'pantry', expiry_date: '' };

export function PantryScreen() {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cookFromPantry = useSelector((s: RootState) => s.pantry.cookFromPantryMode);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [form, setForm] = useState<ItemFormState>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Use hardcoded items from Redux store — no network call needed
  const items = useSelector((s: RootState) => s.pantry.items);


  // All CRUD operates locally on Redux store — no network needed
  const openAdd = useCallback(() => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((item: PantryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      category: item.category,
      location: item.location,
      expiry_date: item.expiry_date ?? '',
    });
    setShowModal(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    if (editingItem) {
      dispatch(updatePantryItem({
        ...editingItem,
        name: form.name,
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        category: form.category,
        location: form.location,
        expiry_date: form.expiry_date || null,
      }));
    } else {
      dispatch(addPantryItem({
        id: String(Date.now()),
        name: form.name,
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        category: form.category,
        location: form.location,
        expiry_date: form.expiry_date || null,
      }));
    }
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  }, [form, editingItem, dispatch]);

  const handleDelete = useCallback((item: PantryItem) => {
    Alert.alert('Delete Item', `Remove ${item.name} from pantry?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(removePantryItem(item.id)) },
    ]);
  }, [dispatch]);

  const filtered = items.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const expiringItems = items.filter((item) => {
    const days = daysUntilExpiry(item.expiry_date);
    return days !== null && days <= EXPIRY_WARNING_DAYS && days >= 0;
  });

  const grouped = CATEGORIES.reduce<Record<string, PantryItem[]>>((acc, cat) => {
    const catItems = filtered.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏠 Pantry</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Cook From Pantry toggle */}
      <View style={styles.modeRow}>
        <View style={styles.modeInfo}>
          <Text style={styles.modeTitle}>Cook From Pantry</Text>
          <Text style={styles.modeDesc}>Filter recipes by available ingredients</Text>
        </View>
        <TouchableOpacity
          style={[styles.modeToggle, cookFromPantry && styles.modeToggleOn]}
          onPress={() => dispatch(toggleCookFromPantry())}
        >
          <Text style={[styles.modeToggleText, cookFromPantry && styles.modeToggleTextOn]}>
            {cookFromPantry ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expiry warnings */}
      {expiringItems.length > 0 && (
        <View style={styles.expiryBanner}>
          <Text style={styles.expiryBannerText}>
            ⚠️ {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring soon:{' '}
            {expiringItems.map((i) => i.name).join(', ')}
          </Text>
        </View>
      )}

      {/* Search + category filter */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search pantry..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        <TouchableOpacity
          style={[styles.catChip, !selectedCategory && styles.catChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.catChipText, !selectedCategory && styles.catChipTextActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          >
            <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
              {CATEGORY_EMOJI[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([cat, catItems]) => (
          <View key={cat} style={styles.catSection}>
            <Text style={styles.catHeader}>
              {CATEGORY_EMOJI[cat] ?? '📦'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
            {catItems.map((item) => {
              const days = daysUntilExpiry(item.expiry_date);
              const isExpiring = days !== null && days <= EXPIRY_WARNING_DAYS;
              const isExpired = days !== null && days < 0;
              return (
                <View key={item.id} style={[styles.itemRow, isExpiring && styles.itemRowWarning, isExpired && styles.itemRowExpired]}>
                  <View style={styles.itemMain}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.quantity} {item.unit} · {item.location}
                      {item.expiry_date ? (
                        isExpired ? ' · EXPIRED' :
                        isExpiring ? ` · Expires in ${days}d` :
                        ` · Exp: ${item.expiry_date}`
                      ) : ''}
                    </Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                      <Text style={styles.editBtnText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                      <Text style={styles.deleteBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥡</Text>
            <Text style={styles.emptyTitle}>Pantry is empty</Text>
            <Text style={styles.emptyDesc}>Add ingredients you have at home</Text>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowModal(false); setEditingItem(null); setForm(EMPTY_FORM); }}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Item' : 'Add to Pantry'}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="e.g. Chicken breast"
              placeholderTextColor={colors.textLight}
            />

            <View style={styles.row2}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>Quantity</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form.quantity}
                  onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {UNITS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.smallChip, form.unit === u && styles.smallChipActive]}
                        onPress={() => setForm((f) => ({ ...f, unit: u }))}
                      >
                        <Text style={[styles.smallChipText, form.unit === u && styles.smallChipTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.smallChip, form.category === c && styles.smallChipActive]}
                  onPress={() => setForm((f) => ({ ...f, category: c }))}
                >
                  <Text style={[styles.smallChipText, form.category === c && styles.smallChipTextActive]}>
                    {CATEGORY_EMOJI[c]} {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Location</Text>
            <View style={styles.chipWrap}>
              {LOCATIONS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.smallChip, form.location === l && styles.smallChipActive]}
                  onPress={() => setForm((f) => ({ ...f, location: l }))}
                >
                  <Text style={[styles.smallChipText, form.location === l && styles.smallChipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Expiry Date (YYYY-MM-DD, optional)</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.expiry_date}
              onChangeText={(v) => setForm((f) => ({ ...f, expiry_date: v }))}
              placeholder="2026-06-01"
              placeholderTextColor={colors.textLight}
            />

            <View style={{ height: 32 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    backBtn: { padding: 4 },
    backText: { fontSize: 22, color: colors.primary },
    headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
    addBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    modeRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, backgroundColor: colors.surfaceElevated, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.divider },
    modeInfo: { flex: 1 },
    modeTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    modeDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    modeToggle: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.border },
    modeToggleOn: { backgroundColor: colors.primary },
    modeToggleText: { fontWeight: '700', fontSize: 13, color: colors.textSecondary },
    modeToggleTextOn: { color: '#fff' },

    expiryBanner: { marginHorizontal: 20, marginBottom: 10, backgroundColor: '#FFF3CD', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#FFD700' },
    expiryBannerText: { fontSize: 13, color: '#856404', fontWeight: '600' },

    searchRow: { paddingHorizontal: 20, marginBottom: 8 },
    searchInput: { backgroundColor: colors.surfaceElevated, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.divider },

    catScroll: { flexGrow: 0, flexShrink: 0, marginBottom: 12 },
    catContent: { paddingHorizontal: 20, gap: 8 },
    catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
    catChipTextActive: { color: '#fff' },

    list: { flex: 1 },
    catSection: { marginBottom: 20, paddingHorizontal: 20 },
    catHeader: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8 },
    itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.divider },
    itemRowWarning: { borderColor: '#FF9500', backgroundColor: '#FFF8EC' },
    itemRowExpired: { borderColor: '#FF3B30', backgroundColor: '#FFF0EF' },
    itemMain: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '700', color: colors.text },
    itemMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    itemActions: { flexDirection: 'row', gap: 8 },
    editBtn: { padding: 6 },
    editBtnText: { fontSize: 18 },
    deleteBtn: { padding: 6 },
    deleteBtnText: { fontSize: 18 },

    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
    emptyDesc: { fontSize: 14, color: colors.textSecondary },

    // Modal
    modalSafe: { flex: 1, backgroundColor: colors.background },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.divider },
    modalCancel: { fontSize: 16, color: colors.textSecondary },
    modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
    modalSave: { fontSize: 16, fontWeight: '700', color: colors.primary },
    modalBody: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
    fieldInput: { backgroundColor: colors.surfaceElevated, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.divider },
    row2: { flexDirection: 'row', alignItems: 'flex-start' },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    smallChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    smallChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    smallChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
    smallChipTextActive: { color: '#fff' },
  });
}
