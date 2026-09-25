import { prisma } from "@/lib/prisma";
import { CategoryNotFoundError } from "@/lib/categories";
import { todayInAppTimezone } from "@/lib/dates";

export class TransactionNotFoundError extends Error {}

export function startOfCurrentMonth(reference = todayInAppTimezone()) {
  return new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1)
  );
}

/** Accepts a "YYYY-MM" string (e.g. from a `?mes=` query param) and returns
 * the first day of that month in UTC. Falls back to the current month for
 * anything missing or malformed. */
export function parseMonthReference(monthParam?: string): Date {
  const match = monthParam?.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return startOfCurrentMonth();
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    return startOfCurrentMonth();
  }
  return new Date(Date.UTC(year, month - 1, 1));
}

/** Sums the absolute value of despesa transactions (negative amounts) per
 * category. Receita transactions (positive amounts) and zero-amount
 * transactions don't count as spend. */
export function sumExpensesByCategory(
  transactions: Array<{ categoryId: string; amount: number }>
): Map<string, number> {
  const result = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.amount >= 0) continue;
    const current = result.get(transaction.categoryId) ?? 0;
    result.set(transaction.categoryId, current - transaction.amount);
  }
  return result;
}

/** Sums receita transactions (positive amounts) per category. Despesa
 * transactions (negative amounts) and zero-amount transactions aren't
 * counted as income. */
export function sumIncomeByCategory(
  transactions: Array<{ categoryId: string; amount: number }>
): Map<string, number> {
  const result = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.amount <= 0) continue;
    const current = result.get(transaction.categoryId) ?? 0;
    result.set(transaction.categoryId, current + transaction.amount);
  }
  return result;
}

function monthRange(monthReference: Date) {
  const end = new Date(
    Date.UTC(
      monthReference.getUTCFullYear(),
      monthReference.getUTCMonth() + 1,
      1
    )
  );
  return { start: monthReference, end };
}

export function getTransactionsForUser(
  userId: string,
  monthReference: Date = startOfCurrentMonth()
) {
  const { start, end } = monthRange(monthReference);
  return prisma.transaction.findMany({
    where: { userId, date: { gte: start, lt: end } },
    include: { category: true },
    orderBy: { date: "desc" },
  });
}

export function getTransactionsForUserSince(userId: string, since: Date) {
  return prisma.transaction.findMany({
    where: { userId, date: { gte: since } },
    include: { category: true },
    orderBy: { date: "asc" },
  });
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
 * derived from the category's kind (receita/despesa), never chosen by the
 * caller. */
export async function createTransaction({
  userId,
  categoryId,
  description,
  amount,
  date,
}: {
  userId: string;
  categoryId: string;
  description: string;
  amount: number;
  date: Date;
}) {
  const category = await getOwnedCategory(categoryId, userId);
  const signedAmount = category.kind === "DESPESA" ? -amount : amount;

  return prisma.transaction.create({
    data: { userId, categoryId, description, amount: signedAmount, date },
  });
}

export async function updateTransaction({
  id,
  userId,
  categoryId,
  description,
  amount,
  date,
}: {
  id: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: number;
  date: Date;
}) {
  const category = await getOwnedCategory(categoryId, userId);
  const signedAmount = category.kind === "DESPESA" ? -amount : amount;

  const { count } = await prisma.transaction.updateMany({
    where: { id, userId },
    data: { categoryId, description, amount: signedAmount, date },
  });

  if (count === 0) {
    throw new TransactionNotFoundError();
  }
}

export async function deleteTransaction({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const { count } = await prisma.transaction.deleteMany({
    where: { id, userId },
  });

  if (count === 0) {
    throw new TransactionNotFoundError();
  }
}
