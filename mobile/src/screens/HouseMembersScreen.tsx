import React, { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import { removeMember, updateHouse } from '../store/slices/houseSlice';
import * as houseService from '../services/houseService';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Avatar, Badge, Button, Card, Header, useToast } from '../components/ui';

export default function HouseMembersScreen() {
  const c = useThemeColors();
  const dispatch = useDispatch();
  const toast = useToast();
  const { house, members } = useSelector((s: RootState) => s.house);
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [refreshingCode, setRefreshingCode] = useState(false);

  if (!house) return null;

  const isAdmin = members.find((m) => m.user_id === currentUser?.id)?.role === 'admin';

  const handleShareCode = () =>
    Share.share({
      message: `Join "${house.name}" on Smart Cooking App! Use invite code: ${house.invite_code}`,
    });

  const handleRefreshCode = () => {
    if (!isAdmin) return;
    Alert.alert('Refresh invite code?', 'The old code will stop working.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Refresh',
        style: 'destructive',
        onPress: async () => {
          setRefreshingCode(true);
          try {
            const updated = await houseService.refreshInviteCode(house.id);
            dispatch(updateHouse(updated));
            toast.show('Code refreshed', 'success');
          } catch {
            toast.show('Could not refresh code', 'error');
          } finally {
            setRefreshingCode(false);
          }
        },
      },
    ]);
  };

  const handleRemoveMember = (userId: string, name: string) => {
    const isSelf = userId === currentUser?.id;
    Alert.alert(
      isSelf ? 'Leave house?' : `Remove ${name}?`,
      isSelf
        ? 'You will lose access to this house.'
        : `${name} will be removed from the house.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isSelf ? 'Leave' : 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await houseService.removeMember(house.id, userId);
              dispatch(removeMember(userId));
              toast.show(isSelf ? 'Left house' : 'Removed', 'success');
            } catch (e: any) {
              toast.show(
                e?.response?.data?.error?.message ?? 'Could not remove',
                'error'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <Header title="Members" border />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <Card
          surface="surface"
          radius="2xl"
          padding="xl"
          elevation="card"
          bordered
          style={{
            borderColor: c.primary,
            backgroundColor: c.primaryMuted,
            marginBottom: spacing['2xl'],
          }}
        >
          <Text style={[typography.overline, { color: c.primary }]}>Invite code</Text>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '800',
              color: c.text,
              letterSpacing: 6,
              marginVertical: spacing.sm,
            }}
          >
            {house.invite_code}
          </Text>
          <Text style={[typography.bodySmall, { color: c.textSecondary, marginBottom: spacing.md }]}>
            Share this code so roommates can join
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button label="Share" onPress={handleShareCode} />
            {isAdmin ? (
              <Button
                label="Refresh"
                variant="secondary"
                onPress={handleRefreshCode}
                loading={refreshingCode}
              />
            ) : null}
          </View>
        </Card>

        {members.map((member) => {
          const isSelf = member.user_id === currentUser?.id;
          const canRemove = isAdmin || isSelf;
          return (
            <Card
              key={member.user_id}
              surface="surface"
              radius="lg"
              padding="md"
              elevation="card"
              bordered
              style={{ marginBottom: spacing.sm }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Avatar name={member.name} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h4, { color: c.text }]}>
                    {member.name}
                    {isSelf ? ' (you)' : ''}
                  </Text>
                  <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                    {member.email}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                  {member.role === 'admin' ? <Badge label="ADMIN" tone="primary" /> : null}
                  {canRemove ? (
                    <Button
                      label={isSelf ? 'Leave' : 'Remove'}
                      variant="ghost"
                      size="sm"
                      onPress={() => handleRemoveMember(member.user_id, member.name)}
                    />
                  ) : null}
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
