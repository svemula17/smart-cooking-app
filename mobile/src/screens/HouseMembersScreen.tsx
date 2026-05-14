import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { removeMember, updateHouse } from '../store/slices/houseSlice';
import * as houseService from '../services/houseService';

export default function HouseMembersScreen() {
  const dispatch = useDispatch();
  const { house, members } = useSelector((s: RootState) => s.house);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [refreshingCode, setRefreshingCode] = useState(false);

  if (!house) return null;

  const isAdmin = members.find((m) => m.user_id === currentUser?.id)?.role === 'admin';

  async function handleShareCode() {
    await Share.share({
      message: `Join "${house!.name}" on Smart Cooking App! Use invite code: ${house!.invite_code}`,
    });
  }

  async function handleRefreshCode() {
    if (!isAdmin) return;
    Alert.alert('Refresh invite code?', 'The old code will stop working.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Refresh',
        style: 'destructive',
        onPress: async () => {
          setRefreshingCode(true);
          try {
            const updated = await houseService.refreshInviteCode(house!.id);
            dispatch(updateHouse(updated));
          } catch {
            Alert.alert('Error', 'Could not refresh invite code');
          } finally {
            setRefreshingCode(false);
          }
        },
      },
    ]);
  }

  async function handleRemoveMember(userId: string, name: string) {
    const isSelf = userId === currentUser?.id;
    Alert.alert(
      isSelf ? 'Leave house?' : `Remove ${name}?`,
      isSelf ? 'You will lose access to this house.' : `${name} will be removed from the house.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isSelf ? 'Leave' : 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await houseService.removeMember(house!.id, userId);
              dispatch(removeMember(userId));
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not remove member');
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Members</Text>

      {/* Invite Code Card */}
      <View style={styles.inviteCard}>
        <Text style={styles.inviteLabel}>INVITE CODE</Text>
        <Text style={styles.inviteCode}>{house.invite_code}</Text>
        <Text style={styles.inviteHint}>Share this code so roommates can join</Text>
        <View style={styles.inviteButtons}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShareCode}>
            <Text style={styles.shareBtnText}>Share code</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={handleRefreshCode}
              disabled={refreshingCode}
            >
              <Text style={styles.refreshBtnText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Members List */}
      {members.map((member) => {
        const isSelf = member.user_id === currentUser?.id;
        const canRemove = isAdmin || isSelf;
        return (
          <View key={member.user_id} style={styles.memberRow}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberInitial}>{member.name?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {member.name}{isSelf ? ' (you)' : ''}
              </Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
            </View>
            <View style={styles.memberRight}>
              {member.role === 'admin' && (
                <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>
              )}
              {canRemove && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member.user_id, member.name)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>{isSelf ? 'Leave' : 'Remove'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 20 },
  inviteCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#E85D04',
  },
  inviteLabel: { fontSize: 11, fontWeight: '700', color: '#E85D04', letterSpacing: 1, marginBottom: 8 },
  inviteCode: { fontSize: 36, fontWeight: '800', color: '#1C1C1E', letterSpacing: 6, marginBottom: 6 },
  inviteHint: { fontSize: 13, color: '#6B6B6B', marginBottom: 14 },
  inviteButtons: { flexDirection: 'row', gap: 10 },
  shareBtn: {
    backgroundColor: '#E85D04',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  refreshBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E85D04',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  refreshBtnText: { color: '#E85D04', fontWeight: '600', fontSize: 14 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E85D04',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: { color: '#fff', fontWeight: '700', fontSize: 18 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  memberEmail: { fontSize: 13, color: '#9B9B9B', marginTop: 2 },
  memberRight: { alignItems: 'flex-end', gap: 6 },
  adminBadge: {
    backgroundColor: '#E85D04',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  adminBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  removeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  removeBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
});
