import { prisma } from "@/lib/prisma";
import { CategoryNotFoundError } from "@/lib/categories";
import { todayInAppTimezone } from "@/lib/dates";
import { occurrenceDateForMonth } from "@/lib/recurring-transactions";

export class BillNotFoundError extends Error {}
export class BillAlreadyPaidError extends Error {}

/** Same day-of-month as `dueDate`, one month later, clamped to the last day
 * of shorter months (reuses the recurring-transaction occurrence logic). */
export function nextMonthDueDate(dueDate: Date): Date {
  const nextMonth = new Date(
    Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth() + 1, 1)
  );
  return occurrenceDateForMonth(dueDate, nextMonth);
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

async function getOwnedBill(id: string, userId: string) {
  const bill = await prisma.bill.findFirst({
    where: { id, userId },
    include: { category: true },
  });
  if (!bill) {
    throw new BillNotFoundError();
  }
  return bill;
}

export function getBillsForUser(userId: string) {
  return prisma.bill.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { dueDate: "asc" },
  });
}

export async function createBill({
  userId,
  categoryId,
  description,
  amount,
  dueDate,
  repeatsMonthly = false,
}: {
  userId: string;
  categoryId: string;
  description: string;
  amount: number;
  dueDate: Date;
  repeatsMonthly?: boolean;
}) {
  await getOwnedCategory(categoryId, userId);

  return prisma.bill.create({
    data: { userId, categoryId, description, amount, dueDate, repeatsMonthly },
  });
}

export async function updateBill({
  id,
  userId,
  categoryId,
  description,
  amount,
  dueDate,
  repeatsMonthly,
}: {
  id: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: number;
  dueDate: Date;
  repeatsMonthly: boolean;
}) {
  const bill = await getOwnedBill(id, userId);
  if (bill.status === "PAGA") {
    throw new BillAlreadyPaidError();
  }
  await getOwnedCategory(categoryId, userId);

  await prisma.bill.update({
    where: { id },
    data: { categoryId, description, amount, dueDate, repeatsMonthly },
  });
}

/** Confirms payment of a pending bill: creates the real `Transaction` for
 * it (signed by the category's kind, same as a normal transaction) and
 * links the bill to it. When the bill repeats monthly, also creates the
 * next occurrence as a new pending bill so it doesn't need to be
 * recreated by hand every month. */
export async function markBillAsPaid({
  id,
  userId,
  paymentDate = todayInAppTimezone(),
}: {
  id: string;
  userId: string;
  paymentDate?: Date;
}) {
  const bill = await getOwnedBill(id, userId);
  if (bill.status === "PAGA") {
    throw new BillAlreadyPaidError();
  }

  const signedAmount =
    bill.category.kind === "DESPESA" ? -Number(bill.amount) : Number(bill.amount);

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        categoryId: bill.categoryId,
        description: bill.description,
        amount: signedAmount,
        date: paymentDate,
      },
    });

    await tx.bill.update({
      where: { id },
      data: { status: "PAGA", linkedTransactionId: transaction.id },
    });

    if (bill.repeatsMonthly) {
      await tx.bill.create({
        data: {
          userId,
          categoryId: bill.categoryId,
          description: bill.description,
          amount: bill.amount,
          dueDate: nextMonthDueDate(bill.dueDate),
          repeatsMonthly: true,
        },
      });
    }
  });
}

export async function deleteBill({ id, userId }: { id: string; userId: string }) {
  const { count } = await prisma.bill.deleteMany({ where: { id, userId } });
  if (count === 0) {
    throw new BillNotFoundError();
  }
}
