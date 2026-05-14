import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { addExpense } from '../store/slices/expenseSlice';
import * as houseService from '../services/houseService';

const CATEGORIES = [
  { key: 'groceries', label: '🛒 Groceries' },
  { key: 'utilities', label: '⚡ Utilities' },
  { key: 'household', label: '🏠 Household' },
  { key: 'other', label: '📦 Other' },
];

export default function AddExpenseScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { house, members } = useSelector((s: RootState) => s.house);
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('groceries');
  const [paidBy, setPaidBy] = useState(currentUser?.id ?? '');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(members.map((m) => m.user_id)),
  );
  const [loading, setLoading] = useState(false);

  function toggleMember(userId: string) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  async function handleSave() {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return Alert.alert('Enter a valid amount');
    if (!description.trim()) return Alert.alert('Enter a description');
    if (selectedMembers.size === 0) return Alert.alert('Select at least one person to split with');
    if (!house) return;

    setLoading(true);
    try {
      const result = await houseService.createExpense(house.id, {
        amount: parsedAmount,
        description: description.trim(),
        category,
        paid_by: paidBy,
        split_user_ids: Array.from(selectedMembers),
      });
      dispatch(addExpense(result.expense));
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not save expense');
    } finally {
      setLoading(false);
    }
  }

  const perPerson = selectedMembers.size > 0 && parseFloat(amount) > 0
    ? (parseFloat(amount) / selectedMembers.size).toFixed(2)
    : '0.00';

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Expense</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#E85D04" /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <View style={styles.amountSection}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          autoFocus
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>DESCRIPTION</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Weekly groceries"
          value={description}
          onChangeText={setDescription}
          maxLength={100}
        />
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, category === cat.key && styles.chipActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={[styles.chipText, category === cat.key && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Paid By */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>PAID BY</Text>
        <View style={styles.chipRow}>
          {members.map((m) => (
            <TouchableOpacity
              key={m.user_id}
              style={[styles.chip, paidBy === m.user_id && styles.chipActive]}
              onPress={() => setPaidBy(m.user_id)}
            >
              <Text style={[styles.chipText, paidBy === m.user_id && styles.chipTextActive]}>
                {m.user_id === currentUser?.id ? 'You' : m.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Split With */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>SPLIT WITH</Text>
        <Text style={styles.splitHint}>
          {selectedMembers.size} people · ₹{perPerson} each
        </Text>
        {members.map((m) => (
          <TouchableOpacity
            key={m.user_id}
            style={styles.memberRow}
            onPress={() => toggleMember(m.user_id)}
          >
            <View style={styles.memberAvatar}>
              <Text style={styles.memberInitial}>{m.name[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.memberName}>
              {m.user_id === currentUser?.id ? 'You' : m.name}
            </Text>
            <View style={[styles.checkbox, selectedMembers.has(m.user_id) && styles.checkboxChecked]}>
              {selectedMembers.has(m.user_id) && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  cancelText: { fontSize: 16, color: '#6B6B6B' },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  saveText: { fontSize: 16, fontWeight: '700', color: '#E85D04' },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  currencySymbol: { fontSize: 36, fontWeight: '700', color: '#6B6B6B', marginRight: 4 },
  amountInput: {
    fontSize: 52,
    fontWeight: '700',
    color: '#1C1C1E',
    minWidth: 120,
    textAlign: 'center',
  },
  field: { padding: 20, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#9B9B9B', letterSpacing: 1, marginBottom: 10 },
  textInput: {
    fontSize: 16,
    color: '#1C1C1E',
    borderBottomWidth: 1.5,
    borderColor: '#E85D04',
    paddingBottom: 8,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: '#FFF3E0', borderColor: '#E85D04' },
  chipText: { fontSize: 14, color: '#6B6B6B' },
  chipTextActive: { color: '#E85D04', fontWeight: '700' },
  splitHint: { fontSize: 13, color: '#16A34A', marginBottom: 12, fontWeight: '600' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E85D04',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: { color: '#fff', fontWeight: '700' },
  memberName: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  checkmark: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
