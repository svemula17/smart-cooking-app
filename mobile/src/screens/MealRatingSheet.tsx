import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { houseApi } from '../services/api';

interface Props {
  visible: boolean;
  scheduleId: string;
  recipeName: string;
  cookName: string;
  onClose: () => void;
  onRated: () => void;
}

export default function MealRatingSheet({ visible, scheduleId, recipeName, cookName, onClose, onRated }: Props) {
  const { house } = useSelector((s: RootState) => s.house);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!selected || !house) return;
    setLoading(true);
    try {
      await houseApi.post(`/houses/${house.id}/schedule/${scheduleId}/ratings`, { rating: selected });
      onRated();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not submit rating');
    } finally {
      setLoading(false);
    }
  }

  const LABELS: Record<number, string> = {
    1: '😞 Poor',
    2: '😕 Okay',
    3: '😊 Good',
    4: '😄 Great',
    5: '🤩 Amazing!',
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>How was dinner?</Text>
        <Text style={styles.subtitle}>
          {cookName.split(' ')[0]} made {recipeName}
        </Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              style={[styles.starBtn, selected === star && styles.starBtnSelected]}
              onPress={() => setSelected(star)}
            >
              <Text style={styles.starEmoji}>{star <= (selected ?? 0) ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selected && (
          <Text style={styles.selectedLabel}>{LABELS[selected]}</Text>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (!selected || loading) && styles.disabled]}
          onPress={handleSubmit}
          disabled={!selected || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Submit Rating</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 44,
    alignItems: 'center',
  },
  handle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B6B6B', marginBottom: 28, textAlign: 'center' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  starBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starBtnSelected: { backgroundColor: '#FFF3E0' },
  starEmoji: { fontSize: 28 },
  selectedLabel: { fontSize: 16, fontWeight: '600', color: '#E85D04', marginBottom: 24 },
  submitBtn: {
    backgroundColor: '#E85D04',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  skipBtn: { padding: 8 },
  skipText: { color: '#9B9B9B', fontSize: 14 },
  disabled: { opacity: 0.5 },
});
