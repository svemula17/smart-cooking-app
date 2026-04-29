import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MacroProgressBar } from '../components/MacroProgressBar';
import { CuisineCard } from '../components/CuisineCard';
import { colors } from '../theme/colors';

export function HomeScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Good evening, chef</Text>
      <Text style={styles.section}>Today's macros</Text>
      <MacroProgressBar label="Protein" consumed={68} goal={120} color={colors.macroProtein} />
      <MacroProgressBar label="Carbs" consumed={210} goal={300} color={colors.macroCarbs} />
      <MacroProgressBar label="Fat" consumed={45} goal={70} color={colors.macroFat} />
      <Text style={styles.section}>Browse cuisines</Text>
      <View style={styles.row}>
        <CuisineCard name="Italian" />
        <CuisineCard name="Japanese" />
        <CuisineCard name="Mexican" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 16 },
  section: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 24, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
