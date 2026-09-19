export type BudgetStatus = {
  isOverBudget: boolean;
  percentage: number | null;
};

/** Compares what was spent in a category against its budget limit for the
 * month. `limitAmount` undefined means no budget was set. */
export function computeBudgetStatus(
  spentAmount: number,
  limitAmount?: number
): BudgetStatus {
  if (limitAmount === undefined) {
    return { isOverBudget: false, percentage: null };
  }

  const isOverBudget = spentAmount > limitAmount;
  const percentage =
    limitAmount > 0
      ? Math.min(100, Math.round((spentAmount / limitAmount) * 100))
      : spentAmount > 0
        ? 100
        : 0;

  return { isOverBudget, percentage };
}
