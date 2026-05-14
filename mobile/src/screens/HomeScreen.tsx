import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { RootStackParamList } from '../types';
import { RootState } from '../store';
import type { CookScheduleEntry } from '../services/houseService';
import AttendanceSheet from './AttendanceSheet';
import { colors } from '../theme/colors';
import { CuisineCard } from '../components/CuisineCard';

type HomeNav = NativeStackNavigationProp<RootStackParamList>;

const CUISINES = [
  { cuisine: 'Indian',        emoji: '🍛', color: colors.indian },
  { cuisine: 'Chinese',       emoji: '🥢', color: colors.chinese },
  { cuisine: 'Indo-Chinese',  emoji: '🍜', color: colors.indoChinese },
  { cuisine: 'Italian',       emoji: '🍝', color: colors.italian },
  { cuisine: 'Mexican',       emoji: '🌮', color: colors.mexican },
  { cuisine: 'Thai',          emoji: '🍜', color: colors.thai },
  { cuisine: 'Japanese',      emoji: '🍱', color: colors.japanese },
  { cuisine: 'Mediterranean', emoji: '🫒', color: colors.mediterranean },
];

function GoalRing({
  label, emoji, current, goal, color, size = 70,
}: { label: string; emoji: string; current: number; goal: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(current / goal, 1) : 0;
  const dash = circumference * pct;
  const cx = size / 2;

  return (
    <View style={styles.goalRingWrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cx} r={r} stroke="#E8EDF3" strokeWidth={7} fill="none" />
          <Circle
            cx={cx}
            cy={cx}
            r={r}
            stroke={color}
            strokeWidth={7}
            fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${cx},${cx}`}
          />
        </Svg>
        <View style={styles.goalRingCenter}>
          <Text style={styles.goalRingEmoji}>{emoji}</Text>
          <Text style={[styles.goalRingPct, { color }]}>{Math.round(pct * 100)}%</Text>
        </View>
      </View>
      <Text style={styles.goalRingLabel}>{label}</Text>
    </View>
  );
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNav>();
  const user        = useSelector((s: RootState) => s.auth.user);
  const preferences = useSelector((s: RootState) => s.user.preferences);
  const macroProgress = useSelector((s: RootState) => s.user.macroProgress);
  const cookFromPantry = useSelector((s: RootState) => s.pantry.cookFromPantryMode);
  const pantryItems = useSelector((s: RootState) => s.pantry.items);
  const house = useSelector((s: RootState) => s.house.house);
  const schedule = useSelector((s: RootState) => s.cookSchedule.schedule);
  const attendance = useSelector((s: RootState) => s.attendance);
  const [showAttendance, setShowAttendance] = useState(false);

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayEntry: CookScheduleEntry | undefined = schedule.find((e) => e.scheduled_date === todayISO);
  const isMyTurn = todayEntry?.user_id === user?.id;
  const hasRespondedToday = attendance.myResponse !== null;

  const userName = user?.name ? user.name.split(' ')[0] : 'Chef';
  const pantryCount = pantryItems.length;
  const expiringSoon = pantryItems.filter((item) => {
    if (!item.expiry_date) return false;
    const ms = new Date(item.expiry_date).getTime() - Date.now();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 3;
  });
  const urgentCount = expiringSoon.length;
  const stableCount = pantryItems.filter((item) => !item.expiry_date).length;
  const readinessScore = pantryCount === 0
    ? 0
    : Math.min(100, Math.round(((stableCount * 0.8) + (pantryCount - urgentCount)) / pantryCount * 100));
  const goals = {
    calories: preferences?.calories_goal ?? 2000,
    protein: preferences?.protein_goal ?? 150,
    carbs: preferences?.carbs_goal ?? 250,
    fat: preferences?.fat_goal ?? 65,
  };
  const topCuisines = CUISINES.slice(0, 6);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName} 👋</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        </View>

        {/* Attendance Card — shown in the morning if not yet responded */}
        {house && todayEntry && !hasRespondedToday && (
          <TouchableOpacity
            style={styles.attendanceCard}
            onPress={() => setShowAttendance(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.attendanceEmoji}>🍽️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.attendanceTitle}>Are you eating tonight?</Text>
              <Text style={styles.attendanceSubtitle}>
                {attendance.summary.attending} eating · {attendance.summary.pending} haven't responded
              </Text>
            </View>
            <Text style={styles.attendanceArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Today's Cook Banner */}
        {house && todayEntry && (
          <TouchableOpacity
            style={[styles.cookBanner, isMyTurn ? styles.cookBannerMyTurn : styles.cookBannerOther]}
            onPress={() => navigation.navigate('Tabs' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.cookBannerEmoji}>👨‍🍳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cookBannerText}>
                {isMyTurn
                  ? "It's your turn to cook today!"
                  : `${todayEntry.cook_name?.split(' ')[0]} is cooking tonight`}
              </Text>
              {todayEntry.recipe_name && (
                <Text style={styles.cookBannerRecipe}>{todayEntry.recipe_name}</Text>
              )}
            </View>
            {isMyTurn && <Text style={styles.cookBannerArrow}>→</Text>}
          </TouchableOpacity>
        )}

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Cook smarter with what you already have.</Text>
          <Text style={styles.heroSubtitle}>
            {urgentCount > 0
              ? `${urgentCount} ingredient${urgentCount > 1 ? 's' : ''} need attention soon.`
              : 'No expiry pressure right now.'} Browse recipes or check what needs using first.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{readinessScore}</Text>
              <Text style={styles.heroStatLabel}>Kitchen readiness</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{pantryCount}</Text>
              <Text style={styles.heroStatLabel}>Tracked ingredients</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, urgentCount > 0 && { color: colors.warning }]}>{urgentCount}</Text>
              <Text style={styles.heroStatLabel}>Use soon</Text>
            </View>
          </View>
          {cookFromPantry && (
            <View style={styles.liveInline}>
              <Text style={styles.liveInlineText}>Pantry matching is shaping recipe priority right now.</Text>
            </View>
          )}
        </View>

        <View style={styles.goalsCard}>
          <View style={styles.sectionHeaderCompact}>
            <View>
              <Text style={styles.sectionTitle}>Daily goals</Text>
              <Text style={styles.sectionSubtitle}>{macroProgress.calories} / {goals.calories} kcal today</Text>
            </View>
          </View>
          <View style={styles.goalsRow}>
            <GoalRing label="Calories" emoji="🔥" current={macroProgress.calories} goal={goals.calories} color={colors.calories} />
            <GoalRing label="Protein" emoji="💪" current={macroProgress.protein} goal={goals.protein} color={colors.protein} />
            <GoalRing label="Carbs" emoji="🌾" current={macroProgress.carbs} goal={goals.carbs} color={colors.carbs} />
            <GoalRing label="Fat" emoji="🫒" current={macroProgress.fat} goal={goals.fat} color={colors.fat} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Use first tonight</Text>
          <Text style={styles.sectionSubtitle}>Keep waste low and momentum high.</Text>
        </View>

        <View style={styles.useSoonCard}>
          {expiringSoon.length > 0 ? (
            expiringSoon.slice(0, 4).map((item) => (
              <View key={item.id} style={styles.useSoonRow}>
                <View style={styles.useSoonDot} />
                <View style={styles.useSoonTextWrap}>
                  <Text style={styles.useSoonName}>{item.name}</Text>
                  <Text style={styles.useSoonMeta}>
                    {item.quantity} {item.unit} · {item.location} · expires {item.expiry_date}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.useSoonEmpty}>Nothing urgent. Your pantry is in a calm zone.</Text>
          )}
          <TouchableOpacity
            style={styles.inlineAction}
            onPress={() => navigation.navigate('RecipeBrowser', { cuisine: 'all', intent: 'use-soon' })}
          >
            <Text style={styles.inlineActionText}>Find a use-it-now dinner →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cook by cuisine</Text>
          <Text style={styles.sectionSubtitle}>Keep the familiar browse flow when you know what you’re craving.</Text>
        </View>

        <View style={styles.cuisineGrid}>
          {topCuisines.map((item) => (
            <CuisineCard
              key={item.cuisine}
              cuisine={item.cuisine}
              emoji={item.emoji}
              color={item.color}
              onPress={() => navigation.navigate('RecipeBrowser', { cuisine: item.cuisine })}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.moreCuisineBtn}
          onPress={() => navigation.navigate('RecipeBrowser', { cuisine: 'all' })}
        >
          <Text style={styles.moreCuisineText}>Browse all cuisines and dishes →</Text>
        </TouchableOpacity>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Pantry')}>
            <Text style={styles.quickBtnEmoji}>🥫</Text>
            <Text style={styles.quickBtnText}>Open Pantry Pulse</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, styles.quickBtnWarm]}
            onPress={() => navigation.navigate('RecipeBrowser', { cuisine: 'all', intent: 'high-protein' })}
          >
            <Text style={styles.quickBtnEmoji}>💪</Text>
            <Text style={styles.quickBtnText}>Protein-first picks</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <AttendanceSheet
        visible={showAttendance}
        onClose={() => setShowAttendance(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: colors.background },
  container:   { flex: 1, backgroundColor: colors.background },
  content:     { paddingBottom: 32 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
  },
  greeting:    { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  userName:    { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 2 },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 22 },
  cookBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  attendanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  attendanceEmoji: { fontSize: 22 },
  attendanceTitle: { fontSize: 14, fontWeight: '700', color: '#1E40AF' },
  attendanceSubtitle: { fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  attendanceArrow: { fontSize: 16, color: '#1E40AF' },
  cookBannerMyTurn: { backgroundColor: '#FFF3E0', borderWidth: 1.5, borderColor: '#E85D04' },
  cookBannerOther: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  cookBannerEmoji: { fontSize: 24 },
  cookBannerText: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  cookBannerRecipe: { fontSize: 13, color: '#6B6B6B', marginTop: 2 },
  cookBannerArrow: { fontSize: 18, color: '#E85D04', fontWeight: '700' },
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#F7F4EE',
    borderWidth: 1,
    borderColor: '#E8DED1',
  },
  heroTitle: { fontSize: 28, lineHeight: 33, fontWeight: '900', color: colors.text, marginBottom: 10 },
  heroSubtitle: { fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  heroStatsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  heroStat: { flex: 1, borderRadius: 16, padding: 14, backgroundColor: '#FFFFFF' },
  heroStatValue: { fontSize: 24, fontWeight: '900', color: colors.accent, marginBottom: 4 },
  heroStatLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  liveInline: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#EEF7EF',
  },
  liveInlineText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  goalsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeaderCompact: { marginBottom: 14 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: colors.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  goalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalRingWrap: { alignItems: 'center', flex: 1 },
  goalRingCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRingEmoji: { fontSize: 16 },
  goalRingPct: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  goalRingLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginTop: 6 },
  useSoonCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFF7EB',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F6D69A',
  },
  useSoonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  useSoonDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.warning, marginTop: 6, marginRight: 10 },
  useSoonTextWrap: { flex: 1 },
  useSoonName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  useSoonMeta: { fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  useSoonEmpty: { fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginBottom: 10 },
  inlineAction: { marginTop: 6, alignSelf: 'flex-start' },
  inlineActionText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  cuisineGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moreCuisineBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  moreCuisineText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  quickRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, gap: 12 },
  quickBtn: {
    flex: 1, backgroundColor: '#EDF6FF', borderRadius: 18,
    paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#C3E0FF',
  },
  quickBtnWarm: { backgroundColor: '#FFF0EE', borderColor: '#FFC8BE' },
  quickBtnEmoji: { fontSize: 22, marginBottom: 4 },
  quickBtnText: { fontSize: 13, fontWeight: '800', color: colors.accent, textAlign: 'center', paddingHorizontal: 8 },
});

export default HomeScreen;
