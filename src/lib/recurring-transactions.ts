import { prisma } from "@/lib/prisma";
import { CategoryNotFoundError } from "@/lib/categories";
import { bucketStart, bucketsInRange } from "@/lib/evolution";
import { startOfCurrentMonth } from "@/lib/transactions";

export class RecurringTransactionNotFoundError extends Error {}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** The date a recurring transaction falls on in a given month: the same
 * day-of-month as `startDate`, clamped to the last day of shorter months
 * (e.g. day 31 becomes day 28/29 in February). */
export function occurrenceDateForMonth(startDate: Date, monthReference: Date): Date {
  const day = Math.min(
    startDate.getUTCDate(),
    daysInMonth(monthReference.getUTCFullYear(), monthReference.getUTCMonth())
  );
  return new Date(
    Date.UTC(monthReference.getUTCFullYear(), monthReference.getUTCMonth(), day)
  );
}

/** The occurrence dates a recurring transaction should have, one per month
 * from `startDate`'s month up to (and including) `upTo`'s month. Empty if
 * `startDate`'s month is after `upTo`'s month.
 *
 * Both dates are truncated to their month start before being handed to
 * `bucketsInRange`: that function treats an empty range as an error (its
 * `from`/`to` are meant to be an already-validated user-picked range), so
 * comparing the raw dates here would wrongly call it empty whenever
 * `startDate`'s day-of-month falls after `upTo`'s (e.g. a recurring
 * transaction starting on the 10th, checked against the 1st of its own
 * start month). */
export function occurrencesUpTo(startDate: Date, upTo: Date): Date[] {
  return bucketsInRange(
    bucketStart(startDate, "mensal"),
    bucketStart(upTo, "mensal"),
    "mensal"
  ).map((month) => occurrenceDateForMonth(startDate, month));
}

export function getRecurringTransactionsForUser(userId: string) {
  return prisma.recurringTransaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
}

/** Creates any Transaction rows a user's active recurring transactions are
 * missing, up to (and including) `upTo`'s month. Safe to call repeatedly:
 * relies on the `[recurringTransactionId, date]` unique constraint to skip
 * occurrences that already exist. */
export async function ensureRecurringTransactionsGenerated(
  userId: string,
  upTo: Date = startOfCurrentMonth()
) {
  const recurring = await prisma.recurringTransaction.findMany({
    where: { userId, isActive: true },
    include: { category: true },
  });

  const data = recurring.flatMap((rt) =>
    occurrencesUpTo(rt.startDate, upTo).map((date) => ({
      userId,
      categoryId: rt.categoryId,
      recurringTransactionId: rt.id,
      description: rt.description,
      amount:
        rt.category.kind === "DESPESA" ? -Number(rt.amount) : Number(rt.amount),
      date,
    }))
  );

  if (data.length === 0) return;

  await prisma.transaction.createMany({ data, skipDuplicates: true });
}

async function getOwnedCategory(categoryId: string, userId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true, kind: true },
  });
  if (!category) {
    throw new CategoryNotFoundError();
  }
  return category;
}

/** `amount` is always the positive value the user entered; the sign is
 * derived from the category's kind when occurrences are generated. */
export async function createRecurringTransaction({
  userId,
  categoryId,
  description,
  amount,
  startDate,
}: {
  userId: string;
  categoryId: string;
  description: string;
  amount: number;
  startDate: Date;
}) {
  await getOwnedCategory(categoryId, userId);

  return prisma.recurringTransaction.create({
    data: { userId, categoryId, description, amount, startDate },
  });
}

export async function updateRecurringTransaction({
  id,
  userId,
  categoryId,
  description,
  amount,
  startDate,
}: {
  id: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: number;
  startDate: Date;
}) {
  await getOwnedCategory(categoryId, userId);

  const { count } = await prisma.recurringTransaction.updateMany({
    where: { id, userId },
    data: { categoryId, description, amount, startDate },
  });

  if (count === 0) {
    throw new RecurringTransactionNotFoundError();
  }
}

export async function setRecurringTransactionActive({
  id,
  userId,
  isActive,
}: {
  id: string;
  userId: string;
  isActive: boolean;
}) {
  const { count } = await prisma.recurringTransaction.updateMany({
    where: { id, userId },
    data: { isActive },
  });

  if (count === 0) {
    throw new RecurringTransactionNotFoundError();
  }
}

export async function deleteRecurringTransaction({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const { count } = await prisma.recurringTransaction.deleteMany({
    where: { id, userId },
  });

  if (count === 0) {
    throw new RecurringTransactionNotFoundError();
  }
}
