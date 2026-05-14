import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setHouse } from '../store/slices/houseSlice';
import * as houseService from '../services/houseService';

type Mode = 'choose' | 'create' | 'join';

export default function HouseOnboardingScreen() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<Mode>('choose');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return Alert.alert('Enter a house name');
    setLoading(true);
    try {
      const result = await houseService.createHouse(name.trim());
      dispatch(setHouse({ house: result.house, members: [] }));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not create house');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (code.trim().length !== 7) return Alert.alert('Enter the 7-character invite code');
    setLoading(true);
    try {
      const result = await houseService.joinHouse(code.trim());
      dispatch(setHouse({ house: result.house, members: result.members }));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'choose') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Set up your house</Text>
        <Text style={styles.subtitle}>
          Coordinate cooking with your roommates — plan meals, share costs, track ingredients.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setMode('create')}>
          <Text style={styles.primaryBtnText}>🏠 Create a new house</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setMode('join')}>
          <Text style={styles.secondaryBtnText}>🔑 Join with invite code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === 'create') {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setMode('choose')} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Name your house</Text>
        <Text style={styles.subtitle}>Give your place a fun name your roommates will recognise.</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The Boys' Kitchen"
          value={name}
          onChangeText={setName}
          maxLength={50}
          autoFocus
        />
        <TouchableOpacity style={[styles.primaryBtn, loading && styles.disabled]} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create house</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setMode('choose')} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Join a house</Text>
      <Text style={styles.subtitle}>Ask a roommate for the 7-character invite code.</Text>
      <TextInput
        style={[styles.input, styles.codeInput]}
        placeholder="e.g. SAIRAJ7"
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        maxLength={7}
        autoCapitalize="characters"
        autoFocus
      />
      <TouchableOpacity style={[styles.primaryBtn, loading && styles.disabled]} onPress={handleJoin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Join house</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 28, justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: 28 },
  backText: { fontSize: 16, color: '#E85D04' },
  title: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#6B6B6B', marginBottom: 36, lineHeight: 24 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  codeInput: { fontSize: 24, fontWeight: '700', textAlign: 'center', letterSpacing: 6 },
  primaryBtn: {
    backgroundColor: '#E85D04',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E85D04',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#E85D04', fontSize: 17, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
