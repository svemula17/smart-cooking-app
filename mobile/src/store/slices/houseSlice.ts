import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { House, HouseMember } from '../../services/houseService';

interface HouseState {
  house: House | null;
  members: HouseMember[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HouseState = {
  house: null,
  members: [],
  isLoading: false,
  error: null,
};

const houseSlice = createSlice({
  name: 'house',
  initialState,
  reducers: {
    setHouse(state, action: PayloadAction<{ house: House | null; members: HouseMember[] }>) {
      state.house = action.payload.house;
      state.members = action.payload.members;
      state.error = null;
    },
    updateHouse(state, action: PayloadAction<House>) {
      state.house = action.payload;
    },
    setMembers(state, action: PayloadAction<HouseMember[]>) {
      state.members = action.payload;
    },
    removeMember(state, action: PayloadAction<string>) {
      state.members = state.members.filter((m) => m.user_id !== action.payload);
    },
    clearHouse(state) {
      state.house = null;
      state.members = [];
    },
    setHouseLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setHouseError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setHouse,
  updateHouse,
  setMembers,
  removeMember,
  clearHouse,
  setHouseLoading,
  setHouseError,
} = houseSlice.actions;

export default houseSlice.reducer;
