export type BudgetStatus = {
  isOverBudget: boolean;
  isNearLimit: boolean;
  percentage: number | null;
};

/** Spending at or above this fraction of the limit (but not yet over it)
 * counts as "near the limit". */
export const BUDGET_WARNING_THRESHOLD = 0.9;

/** Compares what was spent in a category against its budget limit for the
 * month. `limitAmount` undefined means no budget was set. */
export function computeBudgetStatus(
  spentAmount: number,
  limitAmount?: number
): BudgetStatus {
  if (limitAmount === undefined) {
    return { isOverBudget: false, isNearLimit: false, percentage: null };
  }

  const isOverBudget = spentAmount > limitAmount;
  const isNearLimit =
    !isOverBudget &&
    limitAmount > 0 &&
    spentAmount / limitAmount >= BUDGET_WARNING_THRESHOLD;
  const percentage =
    limitAmount > 0
      ? Math.min(100, Math.round((spentAmount / limitAmount) * 100))
      : spentAmount > 0
        ? 100
        : 0;

  return { isOverBudget, isNearLimit, percentage };
}

export type BudgetAlertSeverity = "over" | "near";

export type BudgetAlert = {
  categoryId: string;
  categoryName: string;
  spentAmount: number;
  limitAmount: number;
  percentage: number;
  severity: BudgetAlertSeverity;
};

/** Builds the list of categories that are over or near their budget limit,
 * most severe/highest percentage first. Categories without a budget, or
 * comfortably under the limit, are left out. */
export function computeBudgetAlerts(
  rows: Array<{
    categoryId: string;
    categoryName: string;
    spentAmount: number;
    limitAmount?: number;
  }>
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  for (const row of rows) {
    if (row.limitAmount === undefined) continue;

    const { isOverBudget, isNearLimit, percentage } = computeBudgetStatus(
      row.spentAmount,
      row.limitAmount
    );

    if (!isOverBudget && !isNearLimit) continue;

    alerts.push({
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      spentAmount: row.spentAmount,
      limitAmount: row.limitAmount,
      percentage: percentage!,
      severity: isOverBudget ? "over" : "near",
    });
  }

  return alerts.sort((a, b) => b.percentage - a.percentage);
}
