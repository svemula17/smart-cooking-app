import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { removeExpense, setBalances, setExpenses } from '../store/slices/expenseSlice';
import * as houseService from '../services/houseService';
import type { Expense } from '../services/houseService';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function ExpensesScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { house } = useSelector((s: RootState) => s.house);
  const { expenses, balances, settlements, isLoading } = useSelector((s: RootState) => s.expense);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [settlingWith, setSettlingWith] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!house) return;
    try {
      const [expData, balData] = await Promise.all([
        houseService.listExpenses(house.id, 1),
        houseService.getBalances(house.id),
      ]);
      dispatch(setExpenses({ expenses: expData.expenses, total: expData.pagination.total, page: 1 }));
      dispatch(setBalances(balData));
    } catch {
      Alert.alert('Error', 'Could not load expenses');
    }
  }, [house, dispatch]);

  useEffect(() => { load(); }, [load]);

  async function handleSettle(withUserId: string) {
    if (!house) return;
    setSettlingWith(withUserId);
    try {
      await houseService.settleUp(house.id, withUserId);
      const balData = await houseService.getBalances(house.id);
      dispatch(setBalances(balData));
      Alert.alert('Settled!', 'All debts between you two have been marked as settled.');
    } catch {
      Alert.alert('Error', 'Could not settle up');
    } finally {
      setSettlingWith(null);
    }
  }

  async function handleDelete(expense: Expense) {
    if (!house) return;
    Alert.alert('Delete expense?', `"${expense.description}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await houseService.deleteExpense(house.id, expense.id);
            dispatch(removeExpense(expense.id));
            const balData = await houseService.getBalances(house.id);
            dispatch(setBalances(balData));
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not delete');
          }
        },
      },
    ]);
  }

  const myBalance = balances.find((b) => b.user_id === currentUser?.id);
  const mySettlements = settlements.filter(
    (s) => s.from_user_id === currentUser?.id || s.to_user_id === currentUser?.id,
  );

  function renderExpense({ item }: { item: Expense }) {
    const isPaidByMe = item.paid_by === currentUser?.id;
    return (
      <TouchableOpacity
        style={styles.expenseRow}
        onLongPress={() => handleDelete(item)}
      >
        <View style={styles.expenseIcon}>
          <Text style={styles.expenseIconText}>
            {item.category === 'groceries' ? '🛒' : item.category === 'utilities' ? '⚡' : '🏠'}
          </Text>
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseDesc}>{item.description}</Text>
          <Text style={styles.expenseMeta}>
            Paid by {isPaidByMe ? 'you' : item.paid_by_name} · Split {item.splits.length} ways · {timeAgo(item.created_at)}
          </Text>
        </View>
        <Text style={[styles.expenseAmount, { color: isPaidByMe ? '#16A34A' : '#DC2626' }]}>
          ₹{parseFloat(item.amount).toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Summary */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>YOUR BALANCE</Text>
        {myBalance !== undefined ? (
          <Text style={[styles.balanceNet, { color: myBalance.net >= 0 ? '#16A34A' : '#DC2626' }]}>
            {myBalance.net >= 0
              ? `You are owed ₹${myBalance.net.toFixed(2)}`
              : `You owe ₹${Math.abs(myBalance.net).toFixed(2)}`}
          </Text>
        ) : (
          <Text style={styles.balanceNet}>All settled up!</Text>
        )}

        {/* Settlement suggestions */}
        {mySettlements.map((s, idx) => {
          const isOwer = s.from_user_id === currentUser?.id;
          const otherUserId = isOwer ? s.to_user_id : s.from_user_id;
          const otherName = balances.find((b) => b.user_id === otherUserId)?.name ?? 'someone';
          return (
            <View key={idx} style={styles.settlementRow}>
              <Text style={styles.settlementText}>
                {isOwer ? `Pay ${otherName}` : `${otherName} owes you`} ₹{s.amount.toFixed(2)}
              </Text>
              {isOwer && (
                <TouchableOpacity
                  style={[styles.settleBtn, settlingWith === otherUserId && styles.disabled]}
                  onPress={() => handleSettle(otherUserId)}
                  disabled={settlingWith !== null}
                >
                  {settlingWith === otherUserId ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.settleBtnText}>Settle up</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>ALL EXPENSES</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpense}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptySub}>Tap "+ Add" to log your first grocery run.</Text>
          </View>
        }
      />
    </View>
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
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1C1C1E' },
  addBtn: { backgroundColor: '#E85D04', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceLabel: { fontSize: 11, fontWeight: '700', color: '#9B9B9B', letterSpacing: 1, marginBottom: 8 },
  balanceNet: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  settlementText: { fontSize: 14, color: '#374151', flex: 1 },
  settleBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 80,
    alignItems: 'center',
  },
  settleBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  disabled: { opacity: 0.5 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9B9B9B', letterSpacing: 1, marginHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  expenseRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseIconText: { fontSize: 20 },
  expenseInfo: { flex: 1 },
  expenseDesc: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  expenseMeta: { fontSize: 12, color: '#9B9B9B', marginTop: 2 },
  expenseAmount: { fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  emptySub: { fontSize: 15, color: '#6B6B6B' },
});
