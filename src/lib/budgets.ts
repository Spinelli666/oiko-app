import { prisma } from "@/lib/prisma";
import { CategoryNotFoundError } from "@/lib/categories";
import { todayInAppTimezone } from "@/lib/dates";

export class CategoryNotDespesaError extends Error {}

function currentMonthReference(reference = todayInAppTimezone()) {
  return new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1)
  );
}

export function getBudgetsForCurrentMonth(userId: string) {
  return prisma.budget.findMany({
    where: { userId, monthReference: currentMonthReference() },
  });
}

export async function setBudget({
  userId,
  categoryId,
  limitAmount,
}: {
  userId: string;
  categoryId: string;
  limitAmount: number;
}) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true, kind: true },
  });
  if (!category) {
    throw new CategoryNotFoundError();
  }
  if (category.kind !== "DESPESA") {
    throw new CategoryNotDespesaError();
  }

  const monthReference = currentMonthReference();

  return prisma.budget.upsert({
    where: {
      userId_categoryId_monthReference: {
        userId,
        categoryId,
        monthReference,
      },
    },
    create: { userId, categoryId, monthReference, limitAmount },
    update: { limitAmount },
  });
}

export async function removeBudget({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  await prisma.budget.deleteMany({ where: { id, userId } });
}
