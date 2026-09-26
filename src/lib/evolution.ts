import { todayInAppTimezone } from "@/lib/dates";

export type Granularity = "diario" | "semanal" | "mensal" | "anual";

export type EvolutionPoint = {
  bucketStart: Date;
  receitas: number;
  despesas: number;
  saldo: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function startOfWeek(date: Date): Date {
  const midnight = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = midnight.getUTCDay(); // 0 (dom) .. 6 (sáb)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return new Date(midnight.getTime() + diffToMonday * MS_PER_DAY);
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfYear(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
}

/** The start of the bucket (week/month/year) a given date falls into. */
export function bucketStart(date: Date, granularity: Granularity): Date {
  switch (granularity) {
    case "diario":
      return startOfDay(date);
    case "semanal":
      return startOfWeek(date);
    case "mensal":
      return startOfMonth(date);
    case "anual":
      return startOfYear(date);
  }
}

function addBuckets(date: Date, count: number, granularity: Granularity): Date {
  switch (granularity) {
    case "diario":
      return new Date(date.getTime() + count * MS_PER_DAY);
    case "semanal":
      return new Date(date.getTime() + count * 7 * MS_PER_DAY);
    case "mensal":
      return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1)
      );
    case "anual":
      return new Date(Date.UTC(date.getUTCFullYear() + count, 0, 1));
  }
}

/** The bucket-start dates from `from` to `to` (inclusive), at the given
 * granularity, oldest first. Returns an empty list if `from` is after
 * `to`. */
export function bucketsInRange(
  from: Date,
  to: Date,
  granularity: Granularity
): Date[] {
  if (from.getTime() > to.getTime()) {
    return [];
  }

  const end = bucketStart(to, granularity);
  const buckets: Date[] = [];
  let cursor = bucketStart(from, granularity);
  // Safety cap so a bad/huge range can't loop forever.
  while (cursor.getTime() <= end.getTime() && buckets.length < 1000) {
    buckets.push(cursor);
    cursor = addBuckets(cursor, 1, granularity);
  }
  return buckets;
}

/** Aggregates transactions into receitas/despesas for each bucket in
 * `buckets` (in the order given), and a running `saldo` that carries the
 * balance forward across buckets (including a baseline built from
 * transactions before the first bucket) instead of resetting to zero on
 * buckets with no activity. Transactions after the last bucket are
 * ignored. */
export function computeEvolution(
  transactions: Array<{ date: Date; amount: number }>,
  buckets: Date[],
  granularity: Granularity
): EvolutionPoint[] {
  const key = (d: Date) => d.getTime();
  const totals = new Map<number, { receitas: number; despesas: number }>(
    buckets.map((b) => [key(b), { receitas: 0, despesas: 0 }])
  );

  const firstBucket = buckets[0];
  let runningSaldo = 0;

  for (const transaction of transactions) {
    const transactionBucket = bucketStart(transaction.date, granularity);
    if (firstBucket && transactionBucket.getTime() < firstBucket.getTime()) {
      runningSaldo += transaction.amount;
      continue;
    }
    const bucket = totals.get(key(transactionBucket));
    if (!bucket) continue;
    if (transaction.amount >= 0) {
      bucket.receitas += transaction.amount;
    } else {
      bucket.despesas += -transaction.amount;
    }
  }

  return buckets.map((start) => {
    const bucket = totals.get(key(start))!;
    runningSaldo += bucket.receitas - bucket.despesas;
    return {
      bucketStart: start,
      receitas: bucket.receitas,
      despesas: bucket.despesas,
      saldo: runningSaldo,
    };
  });
}

/** Same bucketing as `computeEvolution`, but keeps each bucket's totals
 * broken down by category instead of collapsed into receitas/despesas. Each
 * bucket's map holds the signed sum of amounts per categoryId (positive for
 * receitas, negative for despesas), so callers can take `Math.abs` per the
 * category's known kind. Transactions outside the bucket range are
 * ignored. */
export function computeEvolutionByCategory(
  transactions: Array<{ date: Date; amount: number; categoryId: string }>,
  buckets: Date[],
  granularity: Granularity
): Array<{ bucketStart: Date; totals: Map<string, number> }> {
  const key = (d: Date) => d.getTime();
  const bucketTotals = new Map<number, Map<string, number>>(
    buckets.map((b) => [key(b), new Map<string, number>()])
  );

  for (const transaction of transactions) {
    const transactionBucket = bucketStart(transaction.date, granularity);
    const totals = bucketTotals.get(key(transactionBucket));
    if (!totals) continue;
    totals.set(
      transaction.categoryId,
      (totals.get(transaction.categoryId) ?? 0) + transaction.amount
    );
  }

  return buckets.map((start) => ({
    bucketStart: start,
    totals: bucketTotals.get(key(start))!,
  }));
}

const DEFAULT_BUCKETS_BACK: Record<Granularity, number> = {
  diario: 6, // últimos 7 dias
  semanal: 6, // últimas 7 semanas
  mensal: 5, // últimos 6 meses
  anual: 6, // últimos 7 anos
};

/** The default [from, to] window shown when a granularity is selected
 * without an explicit custom date range. */
export function defaultRangeFor(
  granularity: Granularity,
  reference = todayInAppTimezone()
): { from: Date; to: Date } {
  const currentBucket = bucketStart(reference, granularity);
  const from = addBuckets(
    currentBucket,
    -DEFAULT_BUCKETS_BACK[granularity],
    granularity
  );
  return { from, to: reference };
}
