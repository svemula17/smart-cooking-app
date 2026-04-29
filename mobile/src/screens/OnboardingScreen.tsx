import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function OnboardingScreen({ navigation }: any): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to Smart Cooking</Text>
      <Text style={styles.body}>Tell us your dietary preferences and goals.</Text>
      <Button title="Get Started" color={colors.primary} onPress={() => navigation.replace('Tabs')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.background },
  heading: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12 },
  body: { fontSize: 16, color: colors.textMuted, marginBottom: 32 },
});
