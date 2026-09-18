import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBudgetsForCurrentMonth } from "@/lib/budgets";
import { getCategoriesForUser } from "@/lib/categories";
import { getTransactionsForUser } from "@/lib/transactions";
import { BudgetRow } from "./budget-row";

export async function OrcamentoContent() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [categories, budgets, transactions] = await Promise.all([
    getCategoriesForUser(session.user.id),
    getBudgetsForCurrentMonth(session.user.id),
    getTransactionsForUser(session.user.id),
  ]);

  const expenseCategories = categories.filter((c) => c.kind === "DESPESA");

  if (expenseCategories.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Orçamento mensal</h1>
        <p className="text-text-secondary">
          Você precisa de uma categoria de despesa antes de definir um
          orçamento.
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

  const budgetByCategory = new Map(budgets.map((b) => [b.categoryId, b]));

  const spentByCategory = new Map<string, number>();
  for (const transaction of transactions) {
    const amount = Number(transaction.amount);
    if (amount >= 0) continue;
    const current = spentByCategory.get(transaction.categoryId) ?? 0;
    spentByCategory.set(transaction.categoryId, current - amount);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Orçamento do mês</h1>

      <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
        <ul className="flex flex-col gap-4">
          {expenseCategories.map((category) => {
            const budget = budgetByCategory.get(category.id);
            return (
              <BudgetRow
                key={category.id}
                category={category}
                budgetId={budget?.id}
                limitAmount={
                  budget ? Number(budget.limitAmount) : undefined
                }
                spentAmount={spentByCategory.get(category.id) ?? 0}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}
