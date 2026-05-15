import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import { addExpense } from '../store/slices/expenseSlice';
import * as houseService from '../services/houseService';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Header,
  IconButton,
  TextField,
  useToast,
} from '../components/ui';

const CATEGORIES = [
  { key: 'groceries', label: '🛒 Groceries' },
  { key: 'utilities', label: '⚡ Utilities' },
  { key: 'household', label: '🏠 Household' },
  { key: 'other', label: '📦 Other' },
];

export default function AddExpenseScreen({ navigation }: any) {
  const c = useThemeColors();
  const dispatch = useDispatch();
  const toast = useToast();
  const { house, members } = useSelector((s: RootState) => s.house);
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('groceries');
  const [paidBy, setPaidBy] = useState(currentUser?.id ?? '');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(members.map((m) => m.user_id))
  );
  const [loading, setLoading] = useState(false);

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        if (next.size === 1) return prev;
        next.delete(userId);
      } else next.add(userId);
      return next;
    });
  };

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return toast.show('Enter a valid amount', 'warning');
    if (!description.trim()) return toast.show('Enter a description', 'warning');
    if (selectedMembers.size === 0) return toast.show('Select at least one person', 'warning');
    if (!house) return;

    setLoading(true);
    try {
      const result = await houseService.createExpense(house.id, {
        amount: parsed,
        description: description.trim(),
        category,
        paid_by: paidBy,
        split_user_ids: Array.from(selectedMembers),
      });
      dispatch(addExpense(result.expense));
      toast.show('Expense added', 'success');
      navigation.goBack();
    } catch (e: any) {
      toast.show(e?.response?.data?.error?.message ?? 'Could not save', 'error');
    } finally {
      setLoading(false);
    }
  };

  const perPerson =
    selectedMembers.size > 0 && parseFloat(amount) > 0
      ? (parseFloat(amount) / selectedMembers.size).toFixed(2)
      : '0.00';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Add expense"
        onBack={() => navigation.goBack()}
        right={
          <Button
            label={loading ? 'Saving' : 'Save'}
            size="sm"
            loading={loading}
            onPress={handleSave}
          />
        }
        border
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing['3xl'] }}>
          {/* Amount */}
          <View style={styles.amountSection}>
            <Text style={{ fontSize: 36, fontWeight: '700', color: c.textSecondary }}>₹</Text>
            <TextInput
              style={{
                fontSize: 52,
                fontWeight: '800',
                color: c.text,
                minWidth: 140,
                textAlign: 'center',
                marginLeft: 4,
              }}
              placeholder="0.00"
              placeholderTextColor={c.textLight}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
              accessibilityLabel="Amount"
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <TextField
              label="Description"
              placeholder="e.g. Weekly groceries"
              value={description}
              onChangeText={setDescription}
              maxLength={100}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[typography.label, { color: c.textSecondary, marginBottom: spacing.sm }]}>
              Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat.key}
                  label={cat.label}
                  selected={category === cat.key}
                  onPress={() => setCategory(cat.key)}
                />
              ))}
            </View>
          </View>

          {/* Paid by */}
          <View style={styles.field}>
            <Text style={[typography.label, { color: c.textSecondary, marginBottom: spacing.sm }]}>
              Paid by
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {members.map((m) => (
                <Chip
                  key={m.user_id}
                  label={m.user_id === currentUser?.id ? 'You' : m.name.split(' ')[0]}
                  selected={paidBy === m.user_id}
                  onPress={() => setPaidBy(m.user_id)}
                />
              ))}
            </View>
          </View>

          {/* Split with */}
          <View style={styles.field}>
            <Text style={[typography.label, { color: c.textSecondary }]}>Split with</Text>
            <Text
              style={{
                color: c.success,
                fontSize: 13,
                fontWeight: '700',
                marginTop: 2,
                marginBottom: spacing.md,
              }}
            >
              {selectedMembers.size} people · ₹{perPerson} each
            </Text>
            {members.map((m) => {
              const checked = selectedMembers.has(m.user_id);
              return (
                <Card
                  key={m.user_id}
                  surface="surface"
                  radius="md"
                  padding="md"
                  elevation="flat"
                  bordered
                  onPress={() => toggleMember(m.user_id)}
                  style={{ marginBottom: spacing.sm }}
                  accessibilityLabel={`Split with ${m.name}, ${checked ? 'included' : 'excluded'}`}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Avatar name={m.name} size={36} />
                    <Text style={[typography.body, { color: c.text, flex: 1, fontWeight: '600' }]}>
                      {m.user_id === currentUser?.id ? 'You' : m.name}
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: checked ? c.success : 'transparent',
                          borderColor: checked ? c.success : c.borderStrong,
                        },
                      ]}
                    >
                      {checked ? (
                        <Text style={{ color: c.onPrimary, fontWeight: '800' }}>✓</Text>
                      ) : null}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  field: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
