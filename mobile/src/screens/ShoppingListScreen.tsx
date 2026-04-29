import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleItem, type RootState } from '../store';
import { colors } from '../theme/colors';

export function ShoppingListScreen(): JSX.Element {
  const items = useSelector((s: RootState) => s.shopping.items);
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping list</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={{ color: colors.textMuted }}>Your list is empty.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => dispatch(toggleItem(item.id))}>
            <Text style={[styles.itemText, item.checked && styles.checked]}>
              {item.quantity} {item.unit} {item.ingredientName}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 12 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemText: { fontSize: 16, color: colors.text },
  checked: { textDecorationLine: 'line-through', color: colors.textMuted },
});
