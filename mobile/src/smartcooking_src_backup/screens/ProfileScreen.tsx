import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth, type RootState } from '../store';
import { colors } from '../theme/colors';

export function ProfileScreen(): JSX.Element {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
      <Text style={styles.email}>{user?.email ?? ''}</Text>
      <View style={{ marginTop: 32 }}>
        <Button title="Sign out" color={colors.danger} onPress={() => dispatch(clearAuth())} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
  name: { fontSize: 24, fontWeight: '700', color: colors.text },
  email: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
});
