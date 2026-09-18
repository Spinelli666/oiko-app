import { prisma } from "@/lib/prisma";
import { CategoryNotFoundError } from "@/lib/categories";

export class TransactionNotFoundError extends Error {}

function currentMonthRange(reference = new Date()) {
  const start = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 1)
  );
  return { start, end };
}

export function getTransactionsForUser(userId: string) {
  const { start, end } = currentMonthRange();
  return prisma.transaction.findMany({
    where: { userId, date: { gte: start, lt: end } },
    include: { category: true },
    orderBy: { date: "desc" },
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
