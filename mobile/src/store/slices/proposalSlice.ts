import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProposalRecipe {
  id: string;
  name: string;
  cuisine_type: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  image_url: string | null;
}

export interface VoteTally {
  recipe_id: string;
  vote_count: string;
  voters: { user_id: string; name: string }[];
}

export interface Proposal {
  id: string;
  cook_schedule_id: string;
  house_id: string;
  recipe_ids: string[];
  status: 'voting' | 'decided';
  selected_recipe_id: string | null;
  voting_ends_at: string;
  created_at: string;
}

interface ProposalState {
  activeProposal: Proposal | null;
  recipes: ProposalRecipe[];
  votes: VoteTally[];
  votingOpen: boolean;
  myVote: string | null;
  isLoading: boolean;
}

const initialState: ProposalState = {
  activeProposal: null,
  recipes: [],
  votes: [],
  votingOpen: false,
  myVote: null,
  isLoading: false,
};

const proposalSlice = createSlice({
  name: 'proposal',
  initialState,
  reducers: {
    setProposal(
      state,
      action: PayloadAction<{
        proposal: Proposal;
        recipes: ProposalRecipe[];
        votes: VoteTally[];
        voting_open: boolean;
      }>,
    ) {
      state.activeProposal = action.payload.proposal;
      state.recipes = action.payload.recipes;
      state.votes = action.payload.votes;
      state.votingOpen = action.payload.voting_open;
      state.isLoading = false;
    },
    setMyVote(state, action: PayloadAction<string>) {
      state.myVote = action.payload;
    },
    clearProposal(state) {
      state.activeProposal = null;
      state.recipes = [];
      state.votes = [];
      state.myVote = null;
    },
    setProposalLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setProposal, setMyVote, clearProposal, setProposalLoading } = proposalSlice.actions;
export default proposalSlice.reducer;
