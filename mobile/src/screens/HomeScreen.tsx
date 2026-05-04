import React from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '../types';
import { RootState } from '../store';
import { CuisineCard } from '../components/CuisineCard';
import { MacroProgressBar } from '../components/MacroProgressBar';
import { colors } from '../theme/colors';

type HomeNav = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const CUISINES = [
  { cuisine: 'Indian', emoji: '🍛', color: colors.indian },
  { cuisine: 'Chinese', emoji: '🥢', color: colors.chinese },
  { cuisine: 'Indo-Chinese', emoji: '🍜', color: colors.indoChinese },
  { cuisine: 'Italian', emoji: '🍝', color: colors.italian },
  { cuisine: 'Mexican', emoji: '🌮', color: colors.mexican },
  { cuisine: 'Thai', emoji: '🍜', color: colors.thai },
  { cuisine: 'Japanese', emoji: '🍱', color: colors.japanese },
  { cuisine: 'Mediterranean', emoji: '🫒', color: colors.mediterranean },
];

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNav>();
  const user = useSelector((s: RootState) => s.auth.user);
  const preferences = useSelector((s: RootState) => s.user.preferences);
  const macroProgress = useSelector((s: RootState) => s.user.macroProgress);

  const goals = {
    calories: preferences?.calories_goal ?? 2000,
    protein: preferences?.protein_goal ?? 150,
    carbs: preferences?.carbs_goal ?? 250,
    fat: preferences?.fat_goal ?? 65,
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Chef';

  const renderCuisineItem = ({ item }: { item: typeof CUISINES[0] }) => (
    <CuisineCard
      cuisine={item.cuisine}
      emoji={item.emoji}
      color={item.color}
      onPress={() => navigation.navigate('RecipeBrowser', { cuisine: item.cuisine })}
    />
  );

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

        {/* Macro Progress Card */}
        <View style={styles.macroCard}>
          <Text style={styles.sectionTitle}>Today's Nutrition</Text>
          <Text style={styles.macroSubtitle}>
            {macroProgress.calories} / {goals.calories} kcal consumed
          </Text>
          <View style={styles.macroList}>
            <MacroProgressBar
              label="Calories"
              current={macroProgress.calories}
              goal={goals.calories}
              color={colors.calories}
              unit="kcal"
            />
            <MacroProgressBar
              label="Protein"
              current={macroProgress.protein}
              goal={goals.protein}
              color={colors.protein}
              unit="g"
            />
            <MacroProgressBar
              label="Carbs"
              current={macroProgress.carbs}
              goal={goals.carbs}
              color={colors.carbs}
              unit="g"
            />
            <MacroProgressBar
              label="Fat"
              current={macroProgress.fat}
              goal={goals.fat}
              color={colors.fat}
              unit="g"
            />
          </View>
        </View>

        {/* Cuisine Section */}
        <View style={styles.cuisineHeader}>
          <Text style={styles.sectionTitle}>What are you craving?</Text>
          <Text style={styles.cuisineSubtitle}>Pick a cuisine to explore</Text>
        </View>

        <FlatList
          data={CUISINES}
          keyExtractor={(item) => item.cuisine}
          renderItem={renderCuisineItem}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.cuisineGrid}
          columnWrapperStyle={styles.cuisineRow}
        />

        {/* Browse All Button */}
        <TouchableOpacity
          style={styles.browseAllBtn}
          onPress={() => navigation.navigate('RecipeBrowser', { cuisine: 'all' })}
        >
          <Text style={styles.browseAllText}>Quick Browse All →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  macroCard: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  macroSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  macroList: {
    gap: 12,
  },
  cuisineHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  cuisineSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cuisineGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cuisineRow: {
    gap: 12,
    justifyContent: 'space-between',
  },
  browseAllBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  browseAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default HomeScreen;
