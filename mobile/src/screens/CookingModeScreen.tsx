import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { TimerButton } from '../components/TimerButton';
import { colors } from '../theme/colors';

export function CookingModeScreen({ route }: any): JSX.Element {
  const { recipeId } = route.params;
  const [step, setStep] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>Step {step + 1}</Text>
      <Text style={styles.instruction}>Instructions for recipe {recipeId}, step {step + 1}.</Text>
      <TimerButton seconds={180} />
      <View style={styles.nav}>
        <Button title="Previous" color={colors.textMuted} onPress={() => setStep((s) => Math.max(0, s - 1))} />
        <Button title="Next" color={colors.primary} onPress={() => setStep((s) => s + 1)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' },
  stepLabel: { fontSize: 14, color: colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  instruction: { fontSize: 22, color: colors.text, marginVertical: 24, lineHeight: 30 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 },
});
