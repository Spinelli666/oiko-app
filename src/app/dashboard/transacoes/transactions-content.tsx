import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCategoriesForUser } from "@/lib/categories";
import { getTransactionsForUser } from "@/lib/transactions";
import { AddTransactionForm } from "./add-transaction-form";
import { TransactionRow } from "./transaction-row";

export async function TransactionsContent() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [categories, transactions] = await Promise.all([
    getCategoriesForUser(session.user.id),
    getTransactionsForUser(session.user.id),
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
      <h1 className="text-2xl font-semibold">Transações do mês</h1>

      <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
        <AddTransactionForm categories={categories} />
      </div>

      <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
        {transactions.length === 0 ? (
          <p className="text-text-secondary">
            Nenhuma transação lançada neste mês ainda.
          </p>
        ) : (
          <ul>
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={{
                  ...transaction,
                  amount: Number(transaction.amount),
                }}
                categories={categories}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
