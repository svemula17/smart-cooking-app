export interface RawExpense {
  id: string;
  paid_by: string;
  amount: string;
}

export interface RawSplit {
  expense_id: string;
  user_id: string;
  amount: string;
  is_settled: boolean;
}

export interface MemberBalance {
  user_id: string;
  net: number; // positive = owed money, negative = owes money
}

export interface PairwiseBalance {
  from_user_id: string;
  to_user_id: string;
  amount: number;
}

/**
 * Calculate the net balance for each member.
 * net > 0: this member is owed that amount
 * net < 0: this member owes that amount
 */
export function calculateNetBalances(
  expenses: RawExpense[],
  splits: RawSplit[],
  memberIds: string[],
): Map<string, number> {
  const balances = new Map<string, number>(memberIds.map((id) => [id, 0]));

  for (const expense of expenses) {
    const amount = parseFloat(expense.amount);
    const payer = expense.paid_by;

    // Payer is credited the full amount
    balances.set(payer, (balances.get(payer) ?? 0) + amount);
  }

  for (const split of splits) {
    if (split.is_settled) continue;
    const amount = parseFloat(split.amount);

    // Each person in the split owes their share
    balances.set(split.user_id, (balances.get(split.user_id) ?? 0) - amount);
  }

  return balances;
}

/**
 * Simplify balances into who owes whom (minimised transactions).
 * Uses a greedy algorithm: match largest debtor with largest creditor.
 */
export function simplifyDebts(balances: Map<string, number>): PairwiseBalance[] {
  const result: PairwiseBalance[] = [];

  const debtors = Array.from(balances.entries())
    .filter(([, v]) => v < -0.01)
    .map(([id, v]) => ({ id, amount: Math.abs(v) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Array.from(balances.entries())
    .filter(([, v]) => v > 0.01)
    .map(([id, v]) => ({ id, amount: v }))
    .sort((a, b) => b.amount - a.amount);

  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debt = debtors[di];
    const credit = creditors[ci];
    const transfer = Math.min(debt.amount, credit.amount);

    result.push({
      from_user_id: debt.id,
      to_user_id: credit.id,
      amount: Math.round(transfer * 100) / 100,
    });

    debt.amount -= transfer;
    credit.amount -= transfer;

    if (debt.amount < 0.01) di++;
    if (credit.amount < 0.01) ci++;
  }

  return result;
}
