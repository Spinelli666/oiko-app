import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getBudgetsForCurrentMonth } from "@/lib/budgets";
import { computeBudgetAlerts } from "@/lib/budget-status";
import { getCategoriesForUser, splitCategoriesByKind } from "@/lib/categories";
import { todayInAppTimezone } from "@/lib/dates";
import { ensureRecurringTransactionsGenerated } from "@/lib/recurring-transactions";
import {
  getTransactionsForUserSince,
  startOfCurrentMonth,
} from "@/lib/transactions";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { BudgetAlertBanner } from "./budget-alert-banner";
import { CategoryBreakdown, type BreakdownNode } from "./category-breakdown";
import { EvolutionSection } from "./evolution-section";

const EVOLUTION_LOOKBACK_YEARS = 5;

function evolutionLookbackStart(reference = todayInAppTimezone()) {
  return new Date(
    Date.UTC(
      reference.getUTCFullYear() - EVOLUTION_LOOKBACK_YEARS,
      reference.getUTCMonth(),
      reference.getUTCDate()
    )
  );
}

type MonthTransaction = {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: Date;
};

/** Groups a month's transactions by category into sorted breakdown nodes,
 * keeping each transaction's description for the expanded view. Only
 * categories with at least one matching transaction are kept. */
function buildBreakdownNodes(
  categories: CategoryModel[],
  transactions: MonthTransaction[],
  limitByCategory?: Map<string, number>
): BreakdownNode[] {
  const transactionsByCategory = new Map<string, MonthTransaction[]>();
  for (const transaction of transactions) {
    const list = transactionsByCategory.get(transaction.categoryId) ?? [];
    list.push(transaction);
    transactionsByCategory.set(transaction.categoryId, list);
  }

  return categories
    .map((category) => {
      const categoryTransactions = (transactionsByCategory.get(category.id) ?? [])
        .slice()
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      const total = categoryTransactions.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );

      return {
        categoryId: category.id,
        name: category.name,
        total,
        limit: limitByCategory?.get(category.id),
        transactions: categoryTransactions.map((t) => ({
          id: t.id,
          description: t.description,
          amount: Math.abs(t.amount),
          date: t.date.toISOString(),
        })),
      };
    })
    .filter((node) => node.total > 0)
    .sort((a, b) => b.total - a.total);
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  await ensureRecurringTransactionsGenerated(session.user.id);

  const [allTransactions, budgets, categories] = await Promise.all([
    getTransactionsForUserSince(session.user.id, evolutionLookbackStart()),
    getBudgetsForCurrentMonth(session.user.id),
    getCategoriesForUser(session.user.id),
  ]);

  const currentMonth = startOfCurrentMonth();
  const transactions = allTransactions.filter((t) => t.date >= currentMonth);

  const balance = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const evolutionTransactions = allTransactions.map((t) => ({
    date: t.date,
    amount: Number(t.amount),
    categoryId: t.categoryId,
  }));

  const evolutionCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    kind: c.kind,
  }));

  const budgetByCategory = new Map(
    budgets.map((b) => [b.categoryId, Number(b.limitAmount)])
  );

  const categoryNameById = new Map(
    transactions.map((t) => [t.categoryId, t.category.name])
  );

  const monthTransactions: MonthTransaction[] = transactions.map((t) => ({
    id: t.id,
    categoryId: t.categoryId,
    description: t.description,
    amount: Number(t.amount),
    date: t.date,
  }));
  const expenseTransactions = monthTransactions.filter((t) => t.amount < 0);
  const incomeTransactions = monthTransactions.filter((t) => t.amount > 0);

  const spentByCategory = new Map<string, number>();
  for (const t of expenseTransactions) {
    spentByCategory.set(
      t.categoryId,
      (spentByCategory.get(t.categoryId) ?? 0) + Math.abs(t.amount)
    );
  }

  const { receitas: receitaCategories, despesas: despesaCategories } =
    splitCategoriesByKind(categories);
  const incomeNodes = buildBreakdownNodes(receitaCategories, incomeTransactions);
  const expenseNodes = buildBreakdownNodes(
    despesaCategories,
    expenseTransactions,
    budgetByCategory
  );

  const budgetAlerts = computeBudgetAlerts(
    [...spentByCategory.entries()].map(([categoryId, spentAmount]) => ({
      categoryId,
      categoryName: categoryNameById.get(categoryId) ?? "",
      spentAmount,
      limitAmount: budgetByCategory.get(categoryId),
    }))
  );

  return (
    <div className="flex flex-1 flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Olá, {session.user.name}
            </h1>
            <p className="text-sm text-text-secondary">{session.user.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-text-secondary/30 px-4 py-2 text-sm font-medium hover:bg-background"
            >
              Sair
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/transacoes"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Lançar transação
          </Link>
          <Link
            href="/dashboard/categorias"
            className="rounded-md border border-text-secondary/30 px-4 py-2 text-sm font-medium"
          >
            Categorias
          </Link>
          <Link
            href="/dashboard/orcamento"
            className="rounded-md border border-text-secondary/30 px-4 py-2 text-sm font-medium"
          >
            Orçamento
          </Link>
        </div>

        <BudgetAlertBanner alerts={budgetAlerts} />

        <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
          <p className="text-sm text-text-secondary">Saldo do mês</p>
          <p
            className={`text-3xl font-semibold ${
              balance < 0 ? "text-alert" : "text-success"
            }`}
          >
            {currencyFormatter.format(balance)}
          </p>
        </div>

        <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
          <p className="mb-3 text-sm font-medium text-text-secondary">
            Evolução
          </p>
          <EvolutionSection
            transactions={evolutionTransactions}
            categories={evolutionCategories}
          />
        </div>

        <CategoryBreakdown income={incomeNodes} expenses={expenseNodes} />
      </div>
    </div>
  );
}
