import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { RecipeBrowserScreen } from '../screens/RecipeBrowserScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { CookingModeScreen } from '../screens/CookingModeScreen';
import { AIChatScreen } from '../screens/AIChatScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  RecipeDetail: { recipeId: string };
  CookingMode: { recipeId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Recipes" component={RecipeBrowserScreen} />
      <Tab.Screen name="AI" component={AIChatScreen} />
      <Tab.Screen name="Shopping" component={ShoppingListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="CookingMode" component={CookingModeScreen} />
    </Stack.Navigator>
  );
}
