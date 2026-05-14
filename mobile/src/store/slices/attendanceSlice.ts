import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AttendanceMember {
  user_id: string;
  name: string;
  email: string;
  is_attending: boolean | null;
  responded_at: string | null;
}

export interface AttendanceSummary {
  attending: number;
  declined: number;
  pending: number;
  total: number;
}

interface AttendanceState {
  date: string;
  members: AttendanceMember[];
  summary: AttendanceSummary;
  myResponse: boolean | null;
  isLoading: boolean;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const initialState: AttendanceState = {
  date: todayISO(),
  members: [],
  summary: { attending: 0, declined: 0, pending: 0, total: 0 },
  myResponse: null,
  isLoading: false,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendance(
      state,
      action: PayloadAction<{ date: string; members: AttendanceMember[]; summary: AttendanceSummary }>,
    ) {
      state.date = action.payload.date;
      state.members = action.payload.members;
      state.summary = action.payload.summary;
    },
    setMyResponse(state, action: PayloadAction<boolean>) {
      state.myResponse = action.payload;
      state.isLoading = false;
    },
    setAttendanceLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    resetAttendance(state) {
      state.members = [];
      state.summary = { attending: 0, declined: 0, pending: 0, total: 0 };
      state.myResponse = null;
    },
  },
});

export const { setAttendance, setMyResponse, setAttendanceLoading, resetAttendance } =
  attendanceSlice.actions;
export default attendanceSlice.reducer;
