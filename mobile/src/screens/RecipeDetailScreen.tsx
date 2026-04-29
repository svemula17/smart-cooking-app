import React from 'react';
import { ScrollView, View, Text, Button, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function RecipeDetailScreen({ route, navigation }: any): JSX.Element {
  const { recipeId } = route.params;
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Recipe {recipeId}</Text>
      <Text style={styles.section}>Ingredients</Text>
      <Text style={styles.body}>Loaded from /recipes/:id</Text>
      <Text style={styles.section}>Instructions</Text>
      <Text style={styles.body}>Step-by-step instructions...</Text>
      <View style={{ marginTop: 24 }}>
        <Button
          title="Start cooking"
          color={colors.primary}
          onPress={() => navigation.navigate('CookingMode', { recipeId })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  section: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 20, marginBottom: 8 },
  body: { fontSize: 15, color: colors.textMuted },
});
