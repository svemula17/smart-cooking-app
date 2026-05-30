import React, { useCallback, useEffect, useState } from 'react';
import { ThemedStatusBar } from "../components/ThemedStatusBar";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import { removeExpense, setBalances, setExpenses } from '../store/slices/expenseSlice';
import * as houseService from '../services/houseService';
import type { Expense } from '../services/houseService';
import { getCategoryMeta } from '../utils/expenseCategories';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  Button,
  Card,
  EmptyState,
  Header,
  useToast,
} from '../components/ui';

const timeAgo = (iso: string): string => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

// Returns { ym: 'YYYY-MM', total, byCategory: { [key]: amount } } per month.
// Keep the iteration cheap — expenses lists are paginated to 1 page (~20
// rows) before this gets called.
function bucketByMonth(expenses: Expense[]): Record<string, { total: number; byCategory: Record<string, number> }> {
  const out: Record<string, { total: number; byCategory: Record<string, number> }> = {};
  for (const e of expenses) {
    const ym = e.created_at.slice(0, 7); // YYYY-MM
    if (!out[ym]) out[ym] = { total: 0, byCategory: {} };
    const amt = parseFloat(e.amount as any) || 0;
    out[ym].total += amt;
    out[ym].byCategory[e.category] = (out[ym].byCategory[e.category] ?? 0) + amt;
  }
  return out;
}

const monthLabel = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return d.toLocaleDateString([], { month: 'long', year: 'numeric' });
};

export default function ExpensesScreen({ navigation }: any) {
  const c = useThemeColors();
  const dispatch = useDispatch();
  const toast = useToast();
  const { house } = useSelector((s: RootState) => s.house);
  const { expenses, balances, settlements, isLoading } = useSelector(
    (s: RootState) => s.expense
  );
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [settlingWith, setSettlingWith] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!house) return;
    try {
      const [expData, balData] = await Promise.all([
        houseService.listExpenses(house.id, 1),
        houseService.getBalances(house.id),
      ]);
      dispatch(
        setExpenses({
          expenses: expData.expenses,
          total: expData.pagination.total,
          page: 1,
        })
      );
      dispatch(setBalances(balData));
    } catch {
      toast.show('Could not load expenses', 'error');
    }
  }, [house, dispatch, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSettle = async (withUserId: string) => {
    if (!house) return;
    setSettlingWith(withUserId);
    try {
      await houseService.settleUp(house.id, withUserId);
      const balData = await houseService.getBalances(house.id);
      dispatch(setBalances(balData));
      toast.show('Settled up', 'success');
    } catch {
      toast.show('Could not settle', 'error');
    } finally {
      setSettlingWith(null);
    }
  };

  const handleDelete = (expense: Expense) => {
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
            toast.show('Removed', 'info');
          } catch (e: any) {
            toast.show(
              e?.response?.data?.error?.message ?? 'Could not delete',
              'error'
            );
          }
        },
      },
    ]);
  };

  const myBalance = balances.find((b) => b.user_id === currentUser?.id);
  const mySettlements = settlements.filter(
    (s) => s.from_user_id === currentUser?.id || s.to_user_id === currentUser?.id
  );

  // Monthly summary — uses the loaded expenses list (most recent page first
  // from the API). For deeper trends you'd need to paginate, but a single
  // page is enough for "this month vs last month".
  const months = bucketByMonth(expenses);
  const thisYm = new Date().toISOString().slice(0, 7);
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevYm = prevDate.toISOString().slice(0, 7);
  const thisMonth = months[thisYm];
  const prevMonth = months[prevYm];
  const monthDelta =
    prevMonth && prevMonth.total > 0 && thisMonth
      ? ((thisMonth.total - prevMonth.total) / prevMonth.total) * 100
      : null;
  // Top 4 categories for the breakdown bars
  const topCategories = thisMonth
    ? Object.entries(thisMonth.byCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
    : [];

  const renderExpense = ({ item }: { item: Expense }) => {
    const isPaidByMe = item.paid_by === currentUser?.id;
    const icon = getCategoryMeta(item.category).emoji;
    return (
      <Card
        surface="surface"
        radius="lg"
        padding="md"
        elevation="card"
        bordered
        onPress={() => handleDelete(item)}
        style={{ marginBottom: spacing.sm }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: c.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h4, { color: c.text }]}>{item.description}</Text>
            <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
              Paid by {isPaidByMe ? 'you' : item.paid_by_name} · split {item.splits.length} ways · {timeAgo(item.created_at)}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '800',
              color: isPaidByMe ? c.success : c.error,
            }}
          >
            ₹{parseFloat(item.amount).toFixed(2)}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ThemedStatusBar />
      <Header
        title="Expenses"
        onBack={() => navigation.goBack()}
        right={<Button label="+ Add" size="sm" onPress={() => navigation.navigate('AddExpense')} />}
        border
      />

      {/* Balance card */}
      <Card
        surface="surface"
        radius="2xl"
        padding="lg"
        elevation="card"
        bordered
        style={{ marginHorizontal: spacing.lg, marginVertical: spacing.md }}
      >
        <Text style={[typography.overline, { color: c.textSecondary }]}>Your balance</Text>
        {myBalance !== undefined ? (
          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: myBalance.net >= 0 ? c.success : c.error,
              marginTop: spacing.xs,
              marginBottom: spacing.md,
            }}
          >
            {myBalance.net >= 0
              ? `You are owed ₹${myBalance.net.toFixed(2)}`
              : `You owe ₹${Math.abs(myBalance.net).toFixed(2)}`}
          </Text>
        ) : (
          <Text style={[typography.h2, { color: c.text, marginVertical: spacing.sm }]}>
            All settled up!
          </Text>
        )}

        {mySettlements.map((s, idx) => {
          const isOwer = s.from_user_id === currentUser?.id;
          const otherUserId = isOwer ? s.to_user_id : s.from_user_id;
          const otherName =
            balances.find((b) => b.user_id === otherUserId)?.name ?? 'someone';
          return (
            <View
              key={idx}
              style={[
                styles.settleRow,
                { backgroundColor: c.surfaceMuted },
              ]}
            >
              <Text style={[typography.body, { color: c.text, flex: 1 }]}>
                {isOwer ? `Pay ${otherName}` : `${otherName} owes you`} ₹{s.amount.toFixed(2)}
              </Text>
              {isOwer ? (
                <Button
                  label="Settle"
                  size="sm"
                  loading={settlingWith === otherUserId}
                  disabled={settlingWith !== null}
                  onPress={() => handleSettle(otherUserId)}
                />
              ) : null}
            </View>
          );
        })}
      </Card>

      {/* Monthly summary — totals + category breakdown + MoM trend */}
      {thisMonth ? (
        <Card
          surface="surface"
          radius="2xl"
          padding="lg"
          elevation="card"
          bordered
          style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text style={[typography.overline, { color: c.textSecondary }]}>
                {monthLabel(thisYm)}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, marginTop: 2 }}>
                ₹{thisMonth.total.toFixed(2)}
              </Text>
            </View>
            {monthDelta !== null ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: monthDelta > 0 ? c.error : c.success,
                  }}
                >
                  {monthDelta > 0 ? '▲' : '▼'} {Math.abs(monthDelta).toFixed(0)}%
                </Text>
                <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                  vs last month
                </Text>
              </View>
            ) : null}
          </View>

          {/* Per-category bars — height encodes share of total */}
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {topCategories.map(([key, amt]) => {
              const meta = getCategoryMeta(key);
              const pct = thisMonth.total > 0 ? (amt / thisMonth.total) * 100 : 0;
              return (
                <View key={key} style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[typography.bodySmall, { color: c.text, fontWeight: '600' }]}>
                      {meta.emoji}  {meta.label}
                    </Text>
                    <Text style={[typography.caption, { color: c.textSecondary, fontWeight: '600' }]}>
                      ₹{amt.toFixed(2)} · {pct.toFixed(0)}%
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: c.surfaceMuted,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: c.primary,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}

      <Text
        style={[typography.overline, { color: c.textSecondary, marginHorizontal: spacing.lg, marginBottom: spacing.sm }]}
      >
        All expenses
      </Text>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpense}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={load} tintColor={c.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="💰"
            title="No expenses yet"
            body="Tap “+ Add” to log your first grocery run."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] },
  settleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
});
