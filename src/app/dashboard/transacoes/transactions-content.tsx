import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCategoriesForUser } from "@/lib/categories";
import {
  ensureRecurringTransactionsGenerated,
  getRecurringTransactionsForUser,
} from "@/lib/recurring-transactions";
import { getTransactionsForUser, startOfCurrentMonth } from "@/lib/transactions";
import { MonthNav } from "./month-nav";
import { TransactionFormTabs } from "./transaction-form-tabs";
import { TransactionsList } from "./transactions-list";

export async function TransactionsContent({
  monthReference,
  withMonthNav = false,
  showTransactionsList = true,
}: {
  monthReference?: Date;
  withMonthNav?: boolean;
  showTransactionsList?: boolean;
} = {}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const effectiveMonth = monthReference ?? startOfCurrentMonth();

  await ensureRecurringTransactionsGenerated(session.user.id);

  const [categories, transactions, recurringTransactions] = await Promise.all([
    getCategoriesForUser(session.user.id),
    getTransactionsForUser(session.user.id, effectiveMonth),
    getRecurringTransactionsForUser(session.user.id),
  ]);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Transações</h1>
        <p className="text-text-secondary">
          Você precisa criar pelo menos uma categoria antes de lançar uma
          transação.
        </p>
        <Link
          href="/dashboard/categorias"
          className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Criar categoria
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Transações</h1>
        {withMonthNav && <MonthNav monthReference={effectiveMonth} />}
      </div>

      <TransactionFormTabs
        categories={categories}
        monthReference={effectiveMonth}
        recurringTransactions={recurringTransactions.map((rt) => ({
          ...rt,
          amount: Number(rt.amount),
        }))}
      />

      {showTransactionsList && (
        <TransactionsList
          transactions={transactions.map((transaction) => ({
            ...transaction,
            amount: Number(transaction.amount),
          }))}
          categories={categories}
        />
      )}
    </div>
  );
}
