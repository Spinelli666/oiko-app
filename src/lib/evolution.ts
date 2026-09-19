import { startOfCurrentMonth } from "@/lib/transactions";

export type MonthlyEvolution = {
  monthReference: Date;
  receitas: number;
  despesas: number;
  saldo: number;
};

/** The month-reference (first day, UTC) of each of the last `months`
 * months, oldest first, ending at the month of `reference`. */
export function lastNMonths(months: number, reference = new Date()): Date[] {
  const current = startOfCurrentMonth(reference);
  const result: Date[] = [];
  for (let i = months - 1; i >= 0; i--) {
    result.push(
      new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - i, 1))
    );
  }
  return result;
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
}

/** Aggregates transactions into receitas/despesas/saldo per month, for each
 * month in `months` (in the order given). Transactions outside those
 * months are ignored. */
export function computeMonthlyEvolution(
  transactions: Array<{ date: Date; amount: number }>,
  months: Date[]
): MonthlyEvolution[] {
  const totals = new Map(
    months.map((month) => [monthKey(month), { receitas: 0, despesas: 0 }])
  );

  for (const transaction of transactions) {
    const bucket = totals.get(
      monthKey(startOfCurrentMonth(transaction.date))
    );
    if (!bucket) continue;
    if (transaction.amount >= 0) {
      bucket.receitas += transaction.amount;
    } else {
      bucket.despesas += -transaction.amount;
    }
  }

  return months.map((monthReference) => {
    const bucket = totals.get(monthKey(monthReference))!;
    return {
      monthReference,
      receitas: bucket.receitas,
      despesas: bucket.despesas,
      saldo: bucket.receitas - bucket.despesas,
    };
  });
}
