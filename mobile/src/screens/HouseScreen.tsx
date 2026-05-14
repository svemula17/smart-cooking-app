import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setHouse, setHouseError, setHouseLoading } from '../store/slices/houseSlice';
import { setSchedule } from '../store/slices/cookScheduleSlice';
import { setBalances } from '../store/slices/expenseSlice';
import * as houseService from '../services/houseService';
import type { ChoreEntry } from '../services/houseService';
import HouseOnboardingScreen from './HouseOnboardingScreen';

// ── Today's Duties Card (inline component) ─────────────────────────────────

function TodaysDutiesCard({
  houseId, currentUserId, navigation,
}: { houseId: string; currentUserId: string; navigation: any }) {
  const TODAY = new Date().toISOString().slice(0, 10);
  const [chores, setChores] = useState<ChoreEntry[]>([]);

  useEffect(() => {
    houseService.getChoreSchedule(houseId, { date: TODAY })
      .then(setChores)
      .catch(() => {});
  }, [houseId]);

  async function markDone(chore: ChoreEntry) {
    if (chore.user_id !== currentUserId) return;
    try {
      const updated = await houseService.updateChoreEntry(houseId, chore.id, { status: 'done' });
      setChores((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch { /* ignore */ }
  }

  return (
    <TouchableOpacity
      style={dutiesStyles.card}
      onPress={() => navigation.navigate('Chores')}
      activeOpacity={0.9}
    >
      <View style={dutiesStyles.cardHeader}>
        <Text style={dutiesStyles.cardLabel}>TODAY'S DUTIES</Text>
        <Text style={dutiesStyles.seeAll}>View all →</Text>
      </View>

      {chores.length === 0 ? (
        <Text style={dutiesStyles.empty}>No chores scheduled — tap to set up</Text>
      ) : (
        chores.map((chore) => {
          const isMe = chore.user_id === currentUserId;
          return (
            <View key={chore.id} style={[dutiesStyles.row, isMe && dutiesStyles.rowMe]}>
              <Text style={dutiesStyles.emoji}>{chore.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={dutiesStyles.choreName}>{chore.chore_name}</Text>
                <Text style={dutiesStyles.assignee}>{isMe ? 'Your turn' : chore.assignee_name}</Text>
              </View>
              {chore.status === 'done' ? (
                <Text style={dutiesStyles.done}>✅</Text>
              ) : isMe ? (
                <TouchableOpacity
                  style={dutiesStyles.doneBtn}
                  onPress={(e) => { e.stopPropagation?.(); markDone(chore); }}
                >
                  <Text style={dutiesStyles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              ) : (
                <Text style={dutiesStyles.pending}>⏳</Text>
              )}
            </View>
          );
        })
      )}
    </TouchableOpacity>
  );
}

const dutiesStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLabel:  { fontSize: 11, fontWeight: '700', color: '#9B9B9B', letterSpacing: 1 },
  seeAll:     { fontSize: 13, color: '#E85D04' },
  row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10, borderTopWidth: 1, borderColor: '#F5F5F5' },
  rowMe:      { backgroundColor: '#FFFBF0', borderRadius: 8, paddingHorizontal: 8, marginHorizontal: -8 },
  emoji:      { fontSize: 20, width: 28, textAlign: 'center' },
  choreName:  { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  assignee:   { fontSize: 12, color: '#9B9B9B', marginTop: 1 },
  done:       { fontSize: 18 },
  pending:    { fontSize: 18, opacity: 0.4 },
  doneBtn:    { backgroundColor: '#E85D04', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  doneBtnText:{ color: '#fff', fontWeight: '700', fontSize: 12 },
  empty:      { fontSize: 13, color: '#9B9B9B', fontStyle: 'italic' },
});

const TODAY = new Date().toISOString().slice(0, 10);

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function HouseScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { house, members, isLoading } = useSelector((s: RootState) => s.house);
  const schedule = useSelector((s: RootState) => s.cookSchedule.schedule);
  const { balances } = useSelector((s: RootState) => s.expense);
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const load = useCallback(async () => {
    dispatch(setHouseLoading(true));
    try {
      const houseData = await houseService.getMyHouse();
      dispatch(setHouse({ house: houseData.house, members: houseData.members }));

      if (houseData.house) {
        const [sched, bal] = await Promise.all([
          houseService.getSchedule(houseData.house.id, 7),
          houseService.getBalances(houseData.house.id),
        ]);
        dispatch(setSchedule(sched));
        dispatch(setBalances(bal));
      }
    } catch {
      dispatch(setHouseError('Could not load house data'));
    } finally {
      dispatch(setHouseLoading(false));
    }
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  if (isLoading && !house) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#E85D04" /></View>;
  }

  if (!house) {
    return <HouseOnboardingScreen />;
  }

  const todayEntry = schedule.find((e) => e.scheduled_date === TODAY);
  const upcomingEntries = schedule.filter((e) => e.scheduled_date > TODAY).slice(0, 5);
  const myBalance = balances.find((b) => b.user_id === currentUser?.id);
  const isMyTurn = todayEntry?.user_id === currentUser?.id;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.houseName}>{house.name}</Text>
          <Text style={styles.memberCount}>{members.length} members</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('HouseMembers')}>
          <Text style={styles.settingsBtn}>⚙ Manage</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Cook */}
      <View style={[styles.card, isMyTurn ? styles.myTurnCard : styles.othersCard]}>
        <Text style={styles.cardLabel}>TODAY'S COOK</Text>
        {todayEntry ? (
          <>
            <Text style={styles.cookName}>
              {isMyTurn ? '👨‍🍳 Your turn to cook!' : `👨‍🍳 ${todayEntry.cook_name} is cooking`}
            </Text>
            {todayEntry.recipe_name ? (
              <Text style={styles.recipeName}>{todayEntry.recipe_name}</Text>
            ) : isMyTurn ? (
              <TouchableOpacity
                style={styles.pickRecipeBtn}
                onPress={() => navigation.navigate('CookSchedule')}
              >
                <Text style={styles.pickRecipeBtnText}>Pick a recipe →</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.recipeName}>Recipe not picked yet</Text>
            )}
            {isMyTurn && (
              <TouchableOpacity
                style={styles.cookingBtn}
                onPress={() => todayEntry.recipe_id && navigation.navigate('CookingMode', { recipeId: todayEntry.recipe_id })}
              >
                <Text style={styles.cookingBtnText}>Start cooking</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>No cook scheduled today</Text>
        )}
      </View>

      {/* Today's Duties — Chores */}
      <TodaysDutiesCard houseId={house.id} currentUserId={currentUser?.id ?? ''} navigation={navigation} />

      {/* Upcoming Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>UPCOMING</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CookSchedule')}>
            <Text style={styles.seeAll}>View full schedule →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {upcomingEntries.length === 0 ? (
            <TouchableOpacity style={styles.generateBtn} onPress={() => navigation.navigate('CookSchedule')}>
              <Text style={styles.generateBtnText}>+ Generate schedule</Text>
            </TouchableOpacity>
          ) : (
            upcomingEntries.map((entry) => (
              <View key={entry.id} style={styles.upcomingChip}>
                <Text style={styles.upcomingDate}>{formatDate(entry.scheduled_date)}</Text>
                <Text style={styles.upcomingCook}>{entry.cook_name?.split(' ')[0]}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Members */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MEMBERS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HouseMembers')}>
            <Text style={styles.seeAll}>Invite code: {house.invite_code}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {members.map((m) => (
            <View key={m.user_id} style={styles.memberChip}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>{m.name?.[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <Text style={styles.memberChipName}>{m.name?.split(' ')[0]}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Quick Links row */}
      <View style={styles.quickLinks}>
        {[
          { label: '🧹 Chores', screen: 'Chores' },
          { label: '🏆 Leaderboard', screen: 'Leaderboard' },
          { label: '🌍 Passport', screen: 'CuisinePassport' },
          { label: '📊 Report', screen: 'HouseReport' },
          { label: '🍱 Prep', screen: 'PrepMeals' },
        ].map((link) => (
          <TouchableOpacity
            key={link.screen}
            style={styles.quickLink}
            onPress={() => navigation.navigate(link.screen)}
          >
            <Text style={styles.quickLinkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Expenses / Balances */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Expenses')}>
        <Text style={styles.cardLabel}>EXPENSES</Text>
        {myBalance !== undefined ? (
          <Text style={[styles.balanceAmount, { color: myBalance.net >= 0 ? '#16A34A' : '#DC2626' }]}>
            {myBalance.net >= 0
              ? `You are owed ₹${myBalance.net.toFixed(2)}`
              : `You owe ₹${Math.abs(myBalance.net).toFixed(2)}`}
          </Text>
        ) : (
          <Text style={styles.emptyText}>No expenses yet</Text>
        )}
        <Text style={styles.viewAll}>View all expenses →</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  houseName: { fontSize: 24, fontWeight: '700', color: '#1C1C1E' },
  memberCount: { fontSize: 14, color: '#6B6B6B', marginTop: 2 },
  settingsBtn: { fontSize: 15, color: '#E85D04', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  myTurnCard: { backgroundColor: '#FFF3E0', borderWidth: 1.5, borderColor: '#E85D04' },
  othersCard: { backgroundColor: '#F0FDF4' },
  cardLabel: { fontSize: 11, fontWeight: '700', color: '#9B9B9B', letterSpacing: 1, marginBottom: 8 },
  cookName: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  recipeName: { fontSize: 15, color: '#6B6B6B', marginBottom: 12 },
  pickRecipeBtn: { alignSelf: 'flex-start' },
  pickRecipeBtnText: { fontSize: 15, color: '#E85D04', fontWeight: '600' },
  cookingBtn: {
    backgroundColor: '#E85D04',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  cookingBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyText: { fontSize: 15, color: '#9B9B9B' },
  section: { marginHorizontal: 16, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9B9B9B', letterSpacing: 1 },
  seeAll: { fontSize: 13, color: '#E85D04' },
  upcomingChip: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 72,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  upcomingDate: { fontSize: 11, color: '#6B6B6B', marginBottom: 4 },
  upcomingCook: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  generateBtn: {
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    padding: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  generateBtnText: { fontSize: 14, color: '#6B6B6B' },
  memberChip: { alignItems: 'center', marginRight: 16 },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E85D04',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberInitial: { color: '#fff', fontWeight: '700', fontSize: 18 },
  memberChipName: { fontSize: 12, color: '#6B6B6B' },
  balanceAmount: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  viewAll: { fontSize: 13, color: '#E85D04', marginTop: 8 },
  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 8, marginBottom: 14 },
  quickLink: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickLinkText: { fontSize: 13, fontWeight: '600', color: '#374151' },
});
