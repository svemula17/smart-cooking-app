import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import {
  setAttendance,
  setAttendanceLoading,
  setMyResponse,
} from '../store/slices/attendanceSlice';
import { houseApi } from '../services/api';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Avatar, Button, Sheet, useToast } from '../components/ui';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AttendanceSheet({ visible, onClose }: Props) {
  const c = useThemeColors();
  const dispatch = useDispatch();
  const toast = useToast();

  const { house } = useSelector((s: RootState) => s.house);
  const { members, summary, myResponse, isLoading } = useSelector((s: RootState) => s.attendance);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const todayEntry = useSelector((s: RootState) =>
    s.cookSchedule.schedule.find(
      (e) => e.scheduled_date === new Date().toISOString().slice(0, 10)
    )
  );

  useEffect(() => {
    if (visible && house) loadAttendance();
  }, [visible, house]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAttendance = async () => {
    if (!house) return;
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/attendance`);
      dispatch(setAttendance(data.data));
      const mine = data.data.members.find((m: any) => m.user_id === currentUser?.id);
      if (mine?.is_attending !== null && mine?.is_attending !== undefined) {
        dispatch(setMyResponse(mine.is_attending));
      }
    } catch {
      // non-critical
    }
  };

  const respond = async (attending: boolean) => {
    if (!house) return;
    dispatch(setAttendanceLoading(true));
    try {
      await houseApi.post(`/houses/${house.id}/attendance`, { is_attending: attending });
      dispatch(setMyResponse(attending));
      await loadAttendance();
    } catch {
      toast.show('Could not save your response', 'error');
      dispatch(setAttendanceLoading(false));
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Who's eating tonight?" height={620}>
      {todayEntry ? (
        <Text style={[typography.bodySmall, { color: c.textSecondary, marginBottom: spacing.lg }]}>
          {todayEntry.cook_name?.split(' ')[0]} is cooking
          {todayEntry.recipe_name ? ` — ${todayEntry.recipe_name}` : ''}
        </Text>
      ) : null}

      {myResponse === null ? (
        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
          <Button
            label="👍 I'm in"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={() => respond(true)}
            hapticStyle="medium"
            style={{ flex: 1 }}
          />
          <Button
            label="👎 Skipping"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => respond(false)}
            style={{ flex: 1 }}
          />
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Text style={[typography.body, { color: c.text, fontWeight: '600' }]}>
            {myResponse ? '✅ You’re eating tonight' : '⏭ You’re skipping tonight'}
          </Text>
          <Button
            label="Change"
            variant="ghost"
            size="sm"
            onPress={() => dispatch(setMyResponse(null as unknown as boolean))}
          />
        </View>
      )}

      <View style={styles.summaryRow}>
        <SummaryChip num={summary.attending} label="eating" tone="success" />
        <SummaryChip num={summary.declined} label="skipping" tone="neutral" />
        <SummaryChip num={summary.pending} label="no response" tone="warning" />
      </View>

      <ScrollView style={{ marginTop: spacing.md }} showsVerticalScrollIndicator={false}>
        {members.map((m, i) => (
          <View
            key={m.user_id}
            style={[
              styles.memberRow,
              { borderTopColor: c.border, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth },
            ]}
          >
            <Avatar name={m.name} size={36} />
            <Text style={[typography.body, { color: c.text, flex: 1 }]}>
              {m.user_id === currentUser?.id ? 'You' : m.name.split(' ')[0]}
            </Text>
            <Text style={{ fontSize: 20 }}>
              {m.is_attending === true ? '✅' : m.is_attending === false ? '❌' : '⏳'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Sheet>
  );
}

function SummaryChip({
  num,
  label,
  tone,
}: {
  num: number;
  label: string;
  tone: 'success' | 'warning' | 'neutral';
}) {
  const c = useThemeColors();
  const bg =
    tone === 'success' ? c.successMuted : tone === 'warning' ? c.warningMuted : c.surfaceMuted;
  return (
    <View style={[styles.summaryChip, { backgroundColor: bg }]}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: c.text }}>{num}</Text>
      <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: spacing.sm },
  summaryChip: { flex: 1, borderRadius: 12, padding: spacing.md, alignItems: 'center' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
});
