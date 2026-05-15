import React, { useCallback, useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import { setMyVote, setProposal, setProposalLoading } from '../store/slices/proposalSlice';
import { houseApi } from '../services/api';

import { useThemeColors } from '../theme/useThemeColors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Badge, Button, Card, Header, Skeleton, useToast } from '../components/ui';

export default function RecipeVoteScreen({ route, navigation }: any) {
  const { proposalId } = route.params as { proposalId: string };
  const c = useThemeColors();
  const dispatch = useDispatch();
  const toast = useToast();
  const { house } = useSelector((s: RootState) => s.house);
  const { activeProposal, recipes, votes, votingOpen, myVote, isLoading } = useSelector(
    (s: RootState) => s.proposal
  );
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const load = useCallback(async () => {
    if (!house) return;
    dispatch(setProposalLoading(true));
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/proposals/${proposalId}`);
      dispatch(setProposal(data.data));
      const myEntry = data.data.votes.find((v: any) =>
        v.voters?.some((vt: any) => vt.user_id === currentUser?.id)
      );
      if (myEntry) dispatch(setMyVote(myEntry.recipe_id));
    } catch {
      toast.show('Could not load proposals', 'error');
    }
  }, [house, proposalId, dispatch, currentUser, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleVote = async (recipeId: string) => {
    if (!house || !votingOpen) return;
    try {
      await houseApi.post(
        `/houses/${house.id}/proposals/${proposalId}/vote`,
        { recipe_id: recipeId }
      );
      dispatch(setMyVote(recipeId));
      toast.show('Vote submitted', 'success');
      await load();
    } catch (e: any) {
      toast.show(e?.response?.data?.error?.message ?? 'Could not vote', 'error');
    }
  };

  const getCount = (recipeId: string) =>
    parseInt(votes.find((v) => v.recipe_id === recipeId)?.vote_count ?? '0', 10);
  const total = votes.reduce((sum, v) => sum + parseInt(v.vote_count, 10), 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Vote on tonight’s meal"
        subtitle={
          activeProposal
            ? `Voting ${
                votingOpen
                  ? `closes ${new Date(activeProposal.voting_ends_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'closed'
              }`
            : undefined
        }
        onBack={() => navigation.goBack()}
        border
      />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['3xl'] }}
      >
        {isLoading ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={100} radius={16} />
            <Skeleton height={100} radius={16} />
          </View>
        ) : (
          recipes.map((recipe) => {
            const count = getCount(recipe.id);
            const pct = total > 0 ? (count / total) * 100 : 0;
            const isMyPick = myVote === recipe.id;
            const isWinner = activeProposal?.selected_recipe_id === recipe.id;

            return (
              <Card
                key={recipe.id}
                surface="surface"
                radius="xl"
                padding="lg"
                elevation="card"
                bordered
                onPress={votingOpen ? () => handleVote(recipe.id) : undefined}
                style={{
                  marginBottom: spacing.md,
                  borderColor: isWinner ? c.success : isMyPick ? c.primary : c.border,
                  backgroundColor: isWinner ? c.successMuted : isMyPick ? c.primaryMuted : c.surface,
                  borderWidth: isWinner || isMyPick ? 2 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h4, { color: c.text }]}>{recipe.name}</Text>
                    <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>
                      {recipe.cuisine_type} ·{' '}
                      {(recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)} min
                    </Text>
                  </View>
                  {isWinner ? (
                    <Badge label="🏆 Winner" tone="success" />
                  ) : isMyPick ? (
                    <Badge label="✓ My vote" tone="primary" />
                  ) : null}
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: c.surfaceMuted,
                    borderRadius: 3,
                    overflow: 'hidden',
                    marginBottom: spacing.xs,
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: c.primary,
                      borderRadius: 3,
                    }}
                  />
                </View>
                <Text style={[typography.caption, { color: c.textSecondary }]}>
                  {count} vote{count !== 1 ? 's' : ''}
                </Text>
              </Card>
            );
          })
        )}

        {!votingOpen && activeProposal?.selected_recipe_id ? (
          <Button
            label="View winning recipe →"
            size="lg"
            fullWidth
            onPress={() =>
              navigation.navigate('RecipeDetail', {
                recipeId: activeProposal.selected_recipe_id,
              })
            }
            style={{ marginTop: spacing.md }}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
