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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '../types';
import { RootState } from '../store';
import { colors } from '../theme/colors';

type HomeNav = NativeStackNavigationProp<RootStackParamList>;

const DINNER_MODES = [
  {
    title: 'Rescue Dinner',
    subtitle: 'The fastest decent plan from what you have',
    emoji: '🚨',
    intent: 'rescue' as const,
    tone: '#FFF2D8',
    border: '#F6C56B',
  },
  {
    title: '20 Minutes Max',
    subtitle: 'Quick wins for low patience nights',
    emoji: '⚡',
    intent: 'fast' as const,
    tone: '#E8F7FF',
    border: '#86CCF3',
  },
  {
    title: 'Low Effort',
    subtitle: 'Less cleanup, less decision fatigue',
    emoji: '🛋️',
    intent: 'low-effort' as const,
    tone: '#F2ECFF',
    border: '#B7A2EF',
  },
  {
    title: 'Use What\'s Close',
    subtitle: 'Cook around ingredients that need attention',
    emoji: '🥬',
    intent: 'use-soon' as const,
    tone: '#E7F8EA',
    border: '#85CD92',
  },
];

const CUISINE_CHIPS = ['Indian', 'Thai', 'Italian', 'Japanese', 'Mexican', 'Mediterranean'];

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNav>();
  const user        = useSelector((s: RootState) => s.auth.user);
  const cookFromPantry = useSelector((s: RootState) => s.pantry.cookFromPantryMode);
  const pantryItems = useSelector((s: RootState) => s.pantry.items);

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

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Tonight Control Center</Text>
            </View>
            {cookFromPantry && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>PANTRY MODE LIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroTitle}>Dinner, figured out from the kitchen you already have.</Text>
          <Text style={styles.heroSubtitle}>
            {urgentCount > 0
              ? `${urgentCount} ingredient${urgentCount > 1 ? 's' : ''} need attention soon.`
              : 'No expiry pressure right now.'} Start with a mode instead of browsing endlessly.
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
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose a dinner mode</Text>
          <Text style={styles.sectionSubtitle}>This should feel like triage, not searching.</Text>
        </View>

        <View style={styles.modeGrid}>
          {DINNER_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.title}
              style={[styles.modeCard, { backgroundColor: mode.tone, borderColor: mode.border }]}
              onPress={() => navigation.navigate('RecipeBrowser', { cuisine: 'all', intent: mode.intent })}
              activeOpacity={0.85}
            >
              <Text style={styles.modeEmoji}>{mode.emoji}</Text>
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
            </TouchableOpacity>
          ))}
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
          <Text style={styles.sectionTitle}>Cook by craving</Text>
          <Text style={styles.sectionSubtitle}>Keep this secondary, but still fun.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineStrip}>
          {CUISINE_CHIPS.map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={styles.cuisineChip}
              onPress={() => navigation.navigate('RecipeBrowser', { cuisine })}
            >
              <Text style={styles.cuisineChipText}>{cuisine}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 22,
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#1F2A44',
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  heroBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)' },
  heroBadgeText: { fontSize: 11, fontWeight: '800', color: '#FCE7B2', letterSpacing: 0.8 },
  liveBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(133,205,146,0.18)' },
  liveBadgeText: { fontSize: 10, fontWeight: '800', color: '#BAF3C2', letterSpacing: 0.7 },
  heroTitle: { fontSize: 29, lineHeight: 34, fontWeight: '900', color: '#FFFFFF', marginBottom: 10 },
  heroSubtitle: { fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.76)' },
  heroStatsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  heroStat: { flex: 1, borderRadius: 18, padding: 14, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroStatValue: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: 4 },
  heroStatLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.68)' },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: colors.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  modeGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modeCard: {
    width: '48%',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    minHeight: 145,
  },
  modeEmoji: { fontSize: 28, marginBottom: 14 },
  modeTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  modeSubtitle: { fontSize: 12, lineHeight: 18, color: colors.textSecondary },
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
  cuisineStrip: { paddingHorizontal: 20, paddingBottom: 4 },
  cuisineChip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: '#F5F1EA',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E7D7C4',
  },
  cuisineChipText: { fontSize: 13, fontWeight: '700', color: '#5A4430' },
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
