import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import * as houseService from '../services/houseService';
import type { ChoreEntry, ChoreType } from '../services/houseService';

const TODAY = new Date().toISOString().slice(0, 10);

const STATUS_COLOR: Record<string, string> = {
  pending: '#F9FAFB',
  done:    '#F0FDF4',
  skipped: '#FEF2F2',
};
const STATUS_LABEL: Record<string, string> = {
  pending: '',
  done:    '✅ Done',
  skipped: '⏭ Skipped',
};

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (iso === TODAY) return 'Today';
  const tom = new Date(); tom.setDate(tom.getDate() + 1);
  if (iso === tom.toISOString().slice(0, 10)) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ── Add Chore Modal ──────────────────────────────────────────────────────────

const EMOJI_PICKS = ['🧽', '🪣', '🧺', '🪴', '🗑️', '🚽', '🪟', '💡', '🔧', '📦'];

function AddChoreModal({
  visible, houseId, onClose, onCreated,
}: {
  visible: boolean; houseId: string;
  onClose: () => void; onCreated: (ct: ChoreType) => void;
}) {
  const [name, setName]         = useState('');
  const [emoji, setEmoji]       = useState('🧽');
  const [freq, setFreq]         = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading]   = useState(false);

  async function handleCreate() {
    if (!name.trim()) return Alert.alert('Enter a chore name');
    setLoading(true);
    try {
      const ct = await houseService.createChoreType(houseId, { name: name.trim(), emoji, frequency: freq });
      onCreated(ct);
      setName(''); setEmoji('🧽'); setFreq('daily');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not create chore');
    } finally { setLoading(false); }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.handle} />
        <Text style={styles.modalTitle}>New Chore</Text>

        <Text style={styles.fieldLabel}>NAME</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Take out trash"
          value={name}
          onChangeText={setName}
          maxLength={50}
          autoFocus
        />

        <Text style={styles.fieldLabel}>EMOJI</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {EMOJI_PICKS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiPick, emoji === e && styles.emojiPickSelected]}
              onPress={() => setEmoji(e)}
            >
              <Text style={styles.emojiPickText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.fieldLabel}>FREQUENCY</Text>
        <View style={styles.freqRow}>
          {(['daily', 'weekly'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.freqBtn, freq === f && styles.freqBtnActive]}
              onPress={() => setFreq(f)}
            >
              <Text style={[styles.freqBtnText, freq === f && styles.freqBtnTextActive]}>
                {f === 'daily' ? '📅 Daily' : '🗓 Weekly'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.createBtn, loading && styles.disabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>Create Chore</Text>}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ── Per-Chore Schedule List ──────────────────────────────────────────────────

function ChoreScheduleTab({
  houseId, choreType, currentUserId, isAdmin,
}: {
  houseId: string; choreType: ChoreType;
  currentUserId: string; isAdmin: boolean;
}) {
  const [schedule, setSchedule] = useState<ChoreEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await houseService.getChoreSchedule(houseId, { type_id: choreType.id, days: 14 });
      setSchedule(entries);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [houseId, choreType.id]);

  useEffect(() => { load(); }, [load]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const newEntries = await houseService.generateChoreSchedule(houseId, choreType.id, 14);
      if (newEntries.length === 0) Alert.alert('All set', 'All dates already have assignments.');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not generate');
    } finally { setGenerating(false); }
  }

  async function handleMarkDone(entry: ChoreEntry) {
    if (entry.user_id !== currentUserId && !isAdmin) return;
    try {
      const updated = await houseService.updateChoreEntry(houseId, entry.id, { status: 'done' });
      setSchedule((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch { Alert.alert('Error', 'Could not update status'); }
  }

  function renderEntry({ item }: { item: ChoreEntry }) {
    const isMe     = item.user_id === currentUserId;
    const isToday  = item.scheduled_date === TODAY;
    return (
      <View style={[styles.entryCard, { backgroundColor: STATUS_COLOR[item.status] }, isToday && styles.todayBorder]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.entryDate, isToday && styles.entryDateToday]}>{formatDate(item.scheduled_date)}</Text>
          <View style={styles.entryRow}>
            <View style={styles.entryAvatar}>
              <Text style={styles.entryAvatarText}>{item.assignee_name?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <Text style={styles.entryName}>{isMe ? 'You' : item.assignee_name}</Text>
          </View>
        </View>
        {STATUS_LABEL[item.status] ? (
          <Text style={styles.statusLabel}>{STATUS_LABEL[item.status]}</Text>
        ) : isMe && item.status === 'pending' ? (
          <TouchableOpacity style={styles.doneBtn} onPress={() => handleMarkDone(item)}>
            <Text style={styles.doneBtnText}>Done ✓</Text>
          </TouchableOpacity>
        ) : isAdmin && item.status === 'pending' ? (
          <TouchableOpacity style={[styles.doneBtn, styles.adminDoneBtn]} onPress={() => handleMarkDone(item)}>
            <Text style={styles.doneBtnText}>Mark done</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabTopBar}>
        <Text style={styles.tabTopBarTitle}>{choreType.emoji} {choreType.name}</Text>
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.disabled]}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating
            ? <ActivityIndicator size="small" color="#E85D04" />
            : <Text style={styles.generateBtnText}>+ {choreType.frequency === 'daily' ? '2 weeks' : '4 weeks'}</Text>}
        </TouchableOpacity>
      </View>
      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No schedule yet</Text>
              <Text style={styles.emptySub}>Tap "+ {choreType.frequency === 'daily' ? '2 weeks' : '4 weeks'}" to auto-assign.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

// ── Today Overview Tab ───────────────────────────────────────────────────────

function TodayTab({
  houseId, currentUserId, cookToday,
}: {
  houseId: string; currentUserId: string;
  cookToday?: { cook_name: string; status: string; recipe_name?: string };
}) {
  const [entries, setEntries] = useState<ChoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    houseService.getChoreSchedule(houseId, { date: TODAY })
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [houseId]);

  async function handleMark(entry: ChoreEntry) {
    if (entry.user_id !== currentUserId) return;
    try {
      const updated = await houseService.updateChoreEntry(houseId, entry.id, { status: 'done' });
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch { Alert.alert('Error', 'Could not update'); }
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <ScrollView contentContainerStyle={styles.todayContent} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => {}} />}>
      <Text style={styles.todayDate}>{dateStr}</Text>

      {/* Cooking row */}
      {cookToday && (
        <View style={[styles.dutyRow, cookToday.status === 'done' && styles.dutyRowDone]}>
          <Text style={styles.dutyEmoji}>🍳</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dutyChore}>Cooking</Text>
            <Text style={styles.dutyAssignee}>
              {cookToday.cook_name}
              {cookToday.recipe_name ? ` — ${cookToday.recipe_name}` : ''}
            </Text>
          </View>
          {cookToday.status === 'done'
            ? <Text style={styles.dutyDone}>✅</Text>
            : <Text style={styles.dutyPending}>⏳</Text>}
        </View>
      )}

      {/* Other chore rows */}
      {loading ? (
        <ActivityIndicator color="#E85D04" style={{ marginTop: 24 }} />
      ) : entries.length === 0 ? (
        <View style={styles.todayNoChores}>
          <Text style={styles.todayNoChoresText}>No chores scheduled today</Text>
          <Text style={styles.todayNoChoresSub}>Generate a schedule in each chore tab.</Text>
        </View>
      ) : (
        entries.map((entry) => {
          const isMe = entry.user_id === currentUserId;
          return (
            <View
              key={entry.id}
              style={[styles.dutyRow, entry.status === 'done' && styles.dutyRowDone, isMe && styles.dutyRowMe]}
            >
              <Text style={styles.dutyEmoji}>{entry.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dutyChore}>{entry.chore_name}</Text>
                <Text style={styles.dutyAssignee}>{isMe ? 'Your turn' : entry.assignee_name}</Text>
              </View>
              {entry.status === 'done' ? (
                <Text style={styles.dutyDone}>✅</Text>
              ) : isMe ? (
                <TouchableOpacity style={styles.markDoneBtn} onPress={() => handleMark(entry)}>
                  <Text style={styles.markDoneBtnText}>Done</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.dutyPending}>⏳</Text>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// ── Root ChoresScreen ────────────────────────────────────────────────────────

export default function ChoresScreen({ navigation }: any) {
  const { house, members } = useSelector((s: RootState) => s.house);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const todayEntry  = useSelector((s: RootState) =>
    s.cookSchedule.schedule.find((e) => e.scheduled_date === TODAY),
  );

  const [choreTypes, setChoreTypes]       = useState<ChoreType[]>([]);
  const [activeTab, setActiveTab]         = useState(0); // 0 = Today, 1+ = chore types
  const [showAddModal, setShowAddModal]   = useState(false);
  const [loading, setLoading]             = useState(true);

  const isAdmin = members.find((m) => m.user_id === currentUser?.id)?.role === 'admin';

  const loadChoreTypes = useCallback(async () => {
    if (!house) return;
    setLoading(true);
    try {
      const types = await houseService.listChoreTypes(house.id);
      setChoreTypes(types);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [house]);

  useEffect(() => { loadChoreTypes(); }, [loadChoreTypes]);

  if (!house) return null;

  const tabs = ['Today', ...choreTypes.map((ct) => `${ct.emoji} ${ct.name}`)];
  const cookToday = todayEntry
    ? {
        cook_name:   todayEntry.cook_name ?? 'Someone',
        status:      todayEntry.status,
        recipe_name: todayEntry.recipe_name,
      }
    : undefined;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>House Chores</Text>
        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabStrip}
        contentContainerStyle={styles.tabStripContent}
      >
        {loading ? (
          <ActivityIndicator color="#E85D04" />
        ) : (
          tabs.map((label, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.tab, activeTab === idx && styles.tabActive]}
              onPress={() => setActiveTab(idx)}
            >
              <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Tab content */}
      {!loading && (
        activeTab === 0 ? (
          <TodayTab
            houseId={house.id}
            currentUserId={currentUser?.id ?? ''}
            cookToday={cookToday}
          />
        ) : (
          <ChoreScheduleTab
            key={choreTypes[activeTab - 1]?.id}
            houseId={house.id}
            choreType={choreTypes[activeTab - 1]!}
            currentUserId={currentUser?.id ?? ''}
            isAdmin={isAdmin}
          />
        )
      )}

      <AddChoreModal
        visible={showAddModal}
        houseId={house.id}
        onClose={() => setShowAddModal(false)}
        onCreated={(ct) => setChoreTypes((prev) => [...prev, ct])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60 },
  back:   { fontSize: 15, color: '#E85D04' },
  title:  { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  addBtn: { backgroundColor: '#E85D04', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 14 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Tab strip
  tabStrip:        { borderBottomWidth: 1, borderColor: '#F0F0F0', maxHeight: 48 },
  tabStripContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  tab:             { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  tabActive:       { backgroundColor: '#FFF3E0' },
  tabText:         { fontSize: 14, color: '#9B9B9B', fontWeight: '600' },
  tabTextActive:   { color: '#E85D04' },

  // Today tab
  todayContent:    { padding: 16 },
  todayDate:       { fontSize: 14, color: '#9B9B9B', fontWeight: '600', marginBottom: 16, letterSpacing: 0.5 },
  dutyRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  dutyRowDone:     { backgroundColor: '#F0FDF4' },
  dutyRowMe:       { borderWidth: 1.5, borderColor: '#E85D04' },
  dutyEmoji:       { fontSize: 24, width: 32, textAlign: 'center' },
  dutyChore:       { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  dutyAssignee:    { fontSize: 13, color: '#6B6B6B', marginTop: 2 },
  dutyDone:        { fontSize: 20 },
  dutyPending:     { fontSize: 20 },
  markDoneBtn:     { backgroundColor: '#E85D04', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  markDoneBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  todayNoChores:   { alignItems: 'center', paddingTop: 40 },
  todayNoChoresText: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  todayNoChoresSub:  { fontSize: 14, color: '#9B9B9B', textAlign: 'center' },

  // Schedule tab
  tabTopBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  tabTopBarTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  generateBtn:    { backgroundColor: '#FFF3E0', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E85D04' },
  generateBtnText:{ color: '#E85D04', fontWeight: '700', fontSize: 13 },
  entryCard:      { borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  todayBorder:    { borderWidth: 2, borderColor: '#E85D04' },
  entryDate:      { fontSize: 12, color: '#9B9B9B', fontWeight: '600', marginBottom: 8 },
  entryDateToday: { color: '#E85D04' },
  entryRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  entryAvatar:    { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E85D04', justifyContent: 'center', alignItems: 'center' },
  entryAvatarText:{ color: '#fff', fontWeight: '700', fontSize: 14 },
  entryName:      { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  statusLabel:    { fontSize: 12, color: '#6B6B6B' },
  doneBtn:        { backgroundColor: '#E85D04', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  adminDoneBtn:   { backgroundColor: '#6B7280' },
  doneBtnText:    { color: '#fff', fontWeight: '700', fontSize: 12 },
  emptyState:     { alignItems: 'center', paddingTop: 60 },
  emptyTitle:     { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  emptySub:       { fontSize: 14, color: '#6B6B6B' },
  disabled:       { opacity: 0.5 },

  // Add Chore Modal
  modalBackdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:     { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44 },
  handle:         { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle:     { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 20 },
  fieldLabel:     { fontSize: 11, fontWeight: '700', color: '#9B9B9B', letterSpacing: 1, marginBottom: 8 },
  textInput:      { borderBottomWidth: 1.5, borderColor: '#E85D04', fontSize: 16, paddingBottom: 8, marginBottom: 20, color: '#1C1C1E' },
  emojiPick:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F3F3', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  emojiPickSelected: { backgroundColor: '#FFF3E0', borderWidth: 2, borderColor: '#E85D04' },
  emojiPickText:  { fontSize: 22 },
  freqRow:        { flexDirection: 'row', gap: 12, marginBottom: 24 },
  freqBtn:        { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: '#F3F3F3', borderWidth: 1.5, borderColor: 'transparent' },
  freqBtnActive:  { backgroundColor: '#FFF3E0', borderColor: '#E85D04' },
  freqBtnText:    { fontSize: 14, fontWeight: '600', color: '#6B6B6B' },
  freqBtnTextActive: { color: '#E85D04' },
  createBtn:      { backgroundColor: '#E85D04', borderRadius: 14, padding: 16, alignItems: 'center' },
  createBtnText:  { color: '#fff', fontWeight: '700', fontSize: 16 },
});
