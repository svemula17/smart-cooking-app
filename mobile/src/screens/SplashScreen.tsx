import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export function SplashScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Cooking</Text>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 32, fontWeight: '700', color: colors.primary, marginBottom: 24 },
});
