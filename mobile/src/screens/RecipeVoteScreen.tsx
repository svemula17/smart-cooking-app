import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setMyVote, setProposal, setProposalLoading } from '../store/slices/proposalSlice';
import { houseApi } from '../services/api';

export default function RecipeVoteScreen({ route, navigation }: any) {
  const { proposalId } = route.params as { proposalId: string };
  const dispatch = useDispatch();
  const { house } = useSelector((s: RootState) => s.house);
  const { activeProposal, recipes, votes, votingOpen, myVote, isLoading } = useSelector(
    (s: RootState) => s.proposal,
  );
  const currentUser = useSelector((s: RootState) => s.auth.user);

  const load = useCallback(async () => {
    if (!house) return;
    dispatch(setProposalLoading(true));
    try {
      const { data } = await houseApi.get(`/houses/${house.id}/proposals/${proposalId}`);
      dispatch(setProposal(data.data));
      const myVoteEntry = data.data.votes.find((v: any) =>
        v.voters?.some((vt: any) => vt.user_id === currentUser?.id),
      );
      if (myVoteEntry) dispatch(setMyVote(myVoteEntry.recipe_id));
    } catch {
      Alert.alert('Error', 'Could not load proposals');
    }
  }, [house, proposalId, dispatch, currentUser]);

  useEffect(() => { load(); }, [load]);

  async function handleVote(recipeId: string) {
    if (!house || !votingOpen) return;
    try {
      await houseApi.post(`/houses/${house.id}/proposals/${proposalId}/vote`, { recipe_id: recipeId });
      dispatch(setMyVote(recipeId));
      await load();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error?.message ?? 'Could not submit vote');
    }
  }

  function getVoteCount(recipeId: string): number {
    return parseInt(votes.find((v) => v.recipe_id === recipeId)?.vote_count ?? '0', 10);
  }

  const totalVotes = votes.reduce((sum, v) => sum + parseInt(v.vote_count, 10), 0);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#E85D04" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Vote on Tonight's Meal</Text>
        {activeProposal && (
          <Text style={styles.deadline}>
            Voting {votingOpen ? `closes ${new Date(activeProposal.voting_ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'closed'}
          </Text>
        )}
      </View>

      {recipes.map((recipe) => {
        const count = getVoteCount(recipe.id);
        const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        const isMyPick = myVote === recipe.id;
        const isWinner = activeProposal?.selected_recipe_id === recipe.id;

        return (
          <TouchableOpacity
            key={recipe.id}
            style={[styles.recipeCard, isMyPick && styles.recipeCardVoted, isWinner && styles.recipeCardWinner]}
            onPress={() => votingOpen && handleVote(recipe.id)}
            activeOpacity={votingOpen ? 0.7 : 1}
          >
            <View style={styles.recipeTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <Text style={styles.recipeMeta}>
                  {recipe.cuisine_type} · {(recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)} min
                </Text>
              </View>
              {isWinner && <Text style={styles.winnerBadge}>🏆 Winner</Text>}
              {isMyPick && !isWinner && <Text style={styles.myPickBadge}>✓ My vote</Text>}
            </View>

            {/* Vote bar */}
            <View style={styles.voteBar}>
              <View style={[styles.voteBarFill, { width: `${pct}%` as any }]} />
            </View>
            <Text style={styles.voteCount}>{count} vote{count !== 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        );
      })}

      {!votingOpen && activeProposal?.selected_recipe_id && (
        <TouchableOpacity
          style={styles.cookItBtn}
          onPress={() => navigation.navigate('RecipeDetail', { recipeId: activeProposal.selected_recipe_id })}
        >
          <Text style={styles.cookItBtnText}>View winning recipe →</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 60, marginBottom: 8 },
  back: { fontSize: 15, color: '#E85D04', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  deadline: { fontSize: 13, color: '#9B9B9B' },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recipeCardVoted: { borderColor: '#E85D04', backgroundColor: '#FFF3E0' },
  recipeCardWinner: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  recipeTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  recipeName: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  recipeMeta: { fontSize: 13, color: '#9B9B9B' },
  winnerBadge: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  myPickBadge: { fontSize: 13, fontWeight: '700', color: '#E85D04' },
  voteBar: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  voteBarFill: { height: '100%', backgroundColor: '#E85D04', borderRadius: 3 },
  voteCount: { fontSize: 12, color: '#9B9B9B' },
  cookItBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  cookItBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
