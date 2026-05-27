// expenseCategories.ts — single source of truth for House → Expenses categories
// and the bill templates that prefill them in AddExpenseScreen.
//
// The backend `expenses.category` column is a free-form TEXT (see migration
// 025). We don't enforce server-side, so adding a new category here is safe
// without a DB change — old categories keep showing too via the lookup
// fallback in `getCategoryMeta`.

export interface ExpenseCategory {
  key: string;
  label: string;
  emoji: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { key: 'groceries',    label: 'Groceries',     emoji: '🛒' },
  { key: 'rent',         label: 'Rent',          emoji: '🏠' },
  { key: 'utilities',    label: 'Utilities',     emoji: '⚡' },
  { key: 'internet',     label: 'Internet',      emoji: '🌐' },
  { key: 'subscriptions',label: 'Subscriptions', emoji: '📺' },
  { key: 'gas',          label: 'Gas',           emoji: '⛽' },
  { key: 'insurance',    label: 'Insurance',     emoji: '🛡️' },
  { key: 'trash',        label: 'Trash',         emoji: '🗑️' },
  { key: 'transport',    label: 'Transport',     emoji: '🚕' },
  { key: 'household',    label: 'Household',     emoji: '🧴' },
  { key: 'other',        label: 'Other',         emoji: '📦' },
];

export function getCategoryMeta(key: string): ExpenseCategory {
  return (
    EXPENSE_CATEGORIES.find((c) => c.key === key) ?? {
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      emoji: '📦',
    }
  );
}

// ─── Bill templates — quick-add presets on AddExpenseScreen ──────────────────
// Each template prefills description + category. Amount/payer/split stay
// up to the user since those change every month.

export interface BillTemplate {
  label: string;       // chip label e.g. "🏠 Rent"
  description: string; // prefilled description
  categoryKey: string;
}

export const BILL_TEMPLATES: BillTemplate[] = [
  { label: '🏠 Rent',         description: 'Monthly rent',         categoryKey: 'rent' },
  { label: '🌐 Internet',     description: 'Internet bill',        categoryKey: 'internet' },
  { label: '⚡ Electricity',  description: 'Electricity bill',     categoryKey: 'utilities' },
  { label: '💧 Water',        description: 'Water bill',           categoryKey: 'utilities' },
  { label: '📺 Netflix',      description: 'Netflix',              categoryKey: 'subscriptions' },
  { label: '🛒 Groceries',    description: 'Weekly groceries',     categoryKey: 'groceries' },
];
