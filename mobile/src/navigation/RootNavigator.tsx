import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RecipeBrowserScreen from '../screens/RecipeBrowserScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import { CookingModeScreen } from '../screens/CookingModeScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { MealPlannerScreen } from '../screens/MealPlannerScreen';
import { MonthlyTrackingScreen } from '../screens/MonthlyTrackingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PantryScreen } from '../screens/PantryScreen';
import HouseScreen from '../screens/HouseScreen';
import HouseMembersScreen from '../screens/HouseMembersScreen';
import CookScheduleScreen from '../screens/CookScheduleScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import RecipeVoteScreen from '../screens/RecipeVoteScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import CuisinePassportScreen from '../screens/CuisinePassportScreen';
import HouseReportScreen from '../screens/HouseReportScreen';
import PrepMealsScreen from '../screens/PrepMealsScreen';
import ChoresScreen from '../screens/ChoresScreen';

import type { RootStackParamList, TabParamList } from '../types';
import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';

// React 19 expands ReactNode to include bigint, which breaks @react-navigation
// v7's ScreenComponentType. Cast all screen components to bypass this.
type AnyComponent = React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

interface TabIconConfig {
  emoji: string;
  label: string;
  a11y: string;
}

const TAB_CONFIG: Record<string, TabIconConfig> = {
  Home: { emoji: '🏡', label: 'Home', a11y: 'Home tab' },
  MealPlanner: { emoji: '📅', label: 'Plan', a11y: 'Meal planner tab' },
  House: { emoji: '👨‍👩‍👧', label: 'House', a11y: 'Household tab' },
  Shopping: { emoji: '🛒', label: 'Shop', a11y: 'Shopping list tab' },
  Stats: { emoji: '📊', label: 'Stats', a11y: 'Stats tab' },
  Profile: { emoji: '👤', label: 'You', a11y: 'Profile tab' },
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const cfg = TAB_CONFIG[name] ?? { emoji: '●', label: name, a11y: name };
  return (
    <View style={tabIconStyles.container}>
      <Text style={[tabIconStyles.emoji, { opacity: focused ? 1 : 0.55 }]}>{cfg.emoji}</Text>
      <View
        style={[
          tabIconStyles.dot,
          { backgroundColor: focused ? color : 'transparent' },
        ]}
      />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', width: 48, height: 36 },
  emoji: { fontSize: 22 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
});

function TabNavigator() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textLight,
        tabBarStyle: {
          backgroundColor: c.background,
          borderTopColor: c.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
          paddingTop: spacing.xs,
          height: 56 + Math.max(insets.bottom, spacing.sm),
          ...Platform.select({
            ios: {
              shadowColor: '#1A1410',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
            },
            android: { elevation: 8 },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        tabBarAccessibilityLabel: TAB_CONFIG[route.name]?.a11y ?? route.name,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarLabel: TAB_CONFIG[route.name]?.label ?? route.name,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen as AnyComponent} />
      <Tab.Screen name="MealPlanner" component={MealPlannerScreen as AnyComponent} />
      <Tab.Screen name="House" component={HouseScreen as AnyComponent} />
      <Tab.Screen name="Shopping" component={ShoppingListScreen as AnyComponent} />
      <Tab.Screen name="Stats" component={MonthlyTrackingScreen as AnyComponent} />
      <Tab.Screen name="Profile" component={ProfileScreen as AnyComponent} />
    </Tab.Navigator>
  );
}

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen as AnyComponent} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen as AnyComponent} />
      <Stack.Screen
        name="Login"
        component={LoginScreen as AnyComponent}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Tabs"
        component={TabNavigator as AnyComponent}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="RecipeBrowser"
        component={RecipeBrowserScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CookingMode"
        component={CookingModeScreen as AnyComponent}
        options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="Pantry"
        component={PantryScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="HouseMembers"
        component={HouseMembersScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CookSchedule"
        component={CookScheduleScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Expenses"
        component={ExpensesScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen as AnyComponent}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="RecipeVote"
        component={RecipeVoteScreen as AnyComponent}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CuisinePassport"
        component={CuisinePassportScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="HouseReport"
        component={HouseReportScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PrepMeals"
        component={PrepMealsScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Chores"
        component={ChoresScreen as AnyComponent}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
