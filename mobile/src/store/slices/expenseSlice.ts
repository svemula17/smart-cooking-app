import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Balance, Expense, Settlement } from '../../services/houseService';

interface ExpenseState {
  expenses: Expense[];
  balances: Balance[];
  settlements: Settlement[];
  page: number;
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  balances: [],
  settlements: [],
  page: 1,
  total: 0,
  isLoading: false,
  error: null,
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setExpenses(state, action: PayloadAction<{ expenses: Expense[]; total: number; page: number }>) {
      state.expenses = action.payload.expenses;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.error = null;
    },
    appendExpenses(state, action: PayloadAction<{ expenses: Expense[]; page: number }>) {
      state.expenses = [...state.expenses, ...action.payload.expenses];
      state.page = action.payload.page;
    },
    addExpense(state, action: PayloadAction<Expense>) {
      state.expenses = [action.payload, ...state.expenses];
      state.total += 1;
    },
    removeExpense(state, action: PayloadAction<string>) {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
    setBalances(state, action: PayloadAction<{ balances: Balance[]; settlements: Settlement[] }>) {
      state.balances = action.payload.balances;
      state.settlements = action.payload.settlements;
    },
    clearExpenses(state) {
      state.expenses = [];
      state.balances = [];
      state.settlements = [];
      state.page = 1;
      state.total = 0;
    },
    setExpenseLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setExpenseError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setExpenses,
  appendExpenses,
  addExpense,
  removeExpense,
  setBalances,
  clearExpenses,
  setExpenseLoading,
  setExpenseError,
} = expenseSlice.actions;

export default expenseSlice.reducer;
