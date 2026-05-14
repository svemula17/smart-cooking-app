import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setAttendance, setAttendanceLoading, setMyResponse } from '../store/slices/attendanceSlice';
import { houseApi } from '../services/api';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AttendanceSheet({ visible, onClose }: Props) {
  const dispatch = useDispatch();
  const { house } = useSelector((s: RootState) => s.house);
  const { members, summary, myResponse, isLoading } = useSelector((s: RootState) => s.attendance);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const todayEntry = useSelector((s: RootState) =>
    s.cookSchedule.schedule.find((e) => e.scheduled_date === new Date().toISOString().slice(0, 10)),
  );

  useEffect(() => {
    if (visible && house) loadAttendance();
  }, [visible, house]);

  async function loadAttendance() {
    if (!house) return;
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/attendance`);
      dispatch(setAttendance(data.data));
      const mine = data.data.members.find((m: any) => m.user_id === currentUser?.id);
      if (mine?.is_attending !== null && mine?.is_attending !== undefined) {
        dispatch(setMyResponse(mine.is_attending));
      }
    } catch {
      // silently fail — attendance is non-critical
    }
  }

  async function respond(attending: boolean) {
    if (!house) return;
    dispatch(setAttendanceLoading(true));
    try {
      await houseApi.post(`/houses/${house.id}/attendance`, { is_attending: attending });
      dispatch(setMyResponse(attending));
      await loadAttendance();
    } catch {
      Alert.alert('Error', 'Could not save your response');
      dispatch(setAttendanceLoading(false));
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>Who's eating tonight?</Text>
        {todayEntry && (
          <Text style={styles.subtitle}>
            {todayEntry.cook_name?.split(' ')[0]} is cooking
            {todayEntry.recipe_name ? ` — ${todayEntry.recipe_name}` : ''}
          </Text>
        )}

        {/* Your response */}
        {myResponse === null ? (
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.responseBtn, styles.yesBtn]}
              onPress={() => respond(true)}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.responseBtnText}>👍 I'm in</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.responseBtn, styles.noBtn]}
              onPress={() => respond(false)}
              disabled={isLoading}
            >
              <Text style={[styles.responseBtnText, { color: '#6B6B6B' }]}>👎 Skipping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.myResponseRow}>
            <Text style={styles.myResponseText}>
              {myResponse ? '✅ You\'re eating tonight' : '⏭ You\'re skipping tonight'}
            </Text>
            <TouchableOpacity onPress={() => dispatch(setMyResponse(null))}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryNum}>{summary.attending}</Text>
            <Text style={styles.summaryLabel}>eating</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryNum}>{summary.declined}</Text>
            <Text style={styles.summaryLabel}>skipping</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryNum}>{summary.pending}</Text>
            <Text style={styles.summaryLabel}>no response</Text>
          </View>
        </View>

        {/* Member list */}
        {members.map((m) => (
          <View key={m.user_id} style={styles.memberRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{m.name[0]?.toUpperCase()}</Text>
            </View>
            <Text style={styles.memberName}>{m.user_id === currentUser?.id ? 'You' : m.name.split(' ')[0]}</Text>
            <Text style={styles.memberStatus}>
              {m.is_attending === true ? '✅' : m.is_attending === false ? '❌' : '⏳'}
            </Text>
          </View>
        ))}
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
    padding: 24,
    paddingBottom: 40,
  },
  handle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B6B6B', marginBottom: 20 },
  ctaRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  responseBtn: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  yesBtn: { backgroundColor: '#16A34A' },
  noBtn: { backgroundColor: '#F3F3F3' },
  responseBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  myResponseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  myResponseText: { fontSize: 15, color: '#1C1C1E', fontWeight: '600' },
  changeText: { fontSize: 14, color: '#E85D04' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryChip: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, alignItems: 'center' },
  summaryNum: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
  summaryLabel: { fontSize: 12, color: '#9B9B9B', marginTop: 2 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderColor: '#F0F0F0' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E85D04', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  memberName: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  memberStatus: { fontSize: 20 },
});
