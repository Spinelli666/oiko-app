import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getBudgetsForCurrentMonth } from "@/lib/budgets";
import {
  getTransactionsForUserSince,
  startOfCurrentMonth,
  sumExpensesByCategory,
  sumIncomeByCategory,
} from "@/lib/transactions";
import { EvolutionSection } from "./evolution-section";

const EVOLUTION_LOOKBACK_YEARS = 5;

function evolutionLookbackStart(reference = new Date()) {
  return new Date(
    Date.UTC(
      reference.getUTCFullYear() - EVOLUTION_LOOKBACK_YEARS,
      reference.getUTCMonth(),
      reference.getUTCDate()
    )
  );
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

  const [allTransactions, budgets] = await Promise.all([
    getTransactionsForUserSince(session.user.id, evolutionLookbackStart()),
    getBudgetsForCurrentMonth(session.user.id),
  ]);

  const currentMonth = startOfCurrentMonth();
  const transactions = allTransactions.filter((t) => t.date >= currentMonth);

  const balance = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const evolutionTransactions = allTransactions.map((t) => ({
    date: t.date,
    amount: Number(t.amount),
  }));

  const budgetByCategory = new Map(
    budgets.map((b) => [b.categoryId, Number(b.limitAmount)])
  );

  const categoryNameById = new Map(
    transactions.map((t) => [t.categoryId, t.category.name])
  );

  const spentByCategory = sumExpensesByCategory(
    transactions.map((t) => ({
      categoryId: t.categoryId,
      amount: Number(t.amount),
    }))
  );
  const sortedExpenses = [...spentByCategory.entries()]
    .map(
      ([categoryId, spent]) =>
        [categoryId, { name: categoryNameById.get(categoryId) ?? "", spent }] as const
    )
    .sort((a, b) => b[1].spent - a[1].spent);

  const incomeByCategory = sumIncomeByCategory(
    transactions.map((t) => ({
      categoryId: t.categoryId,
      amount: Number(t.amount),
    }))
  );
  const sortedIncome = [...incomeByCategory.entries()]
    .map(
      ([categoryId, received]) =>
        [categoryId, { name: categoryNameById.get(categoryId) ?? "", received }] as const
    )
    .sort((a, b) => b[1].received - a[1].received);

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
          <EvolutionSection transactions={evolutionTransactions} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
            <p className="mb-3 text-sm font-medium text-text-secondary">
              Receitas por categoria
            </p>
            {sortedIncome.length === 0 ? (
              <p className="text-text-secondary">
                Nenhuma receita lançada neste mês ainda.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sortedIncome.map(([categoryId, { name, received }]) => (
                  <li
                    key={categoryId}
                    className="flex items-center justify-between"
                  >
                    <span>{name}</span>
                    <span className="font-medium text-success">
                      {currencyFormatter.format(received)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
            <p className="mb-3 text-sm font-medium text-text-secondary">
              Despesas por categoria
            </p>
            {sortedExpenses.length === 0 ? (
              <p className="text-text-secondary">
                Nenhuma despesa lançada neste mês ainda.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sortedExpenses.map(([categoryId, { name, spent }]) => {
                  const limit = budgetByCategory.get(categoryId);
                  return (
                    <li
                      key={categoryId}
                      className="flex items-center justify-between"
                    >
                      <span>{name}</span>
                      <span className="font-medium text-alert">
                        {currencyFormatter.format(spent)}
                        {limit !== undefined && (
                          <span className="font-normal text-text-secondary">
                            {" "}
                            / {currencyFormatter.format(limit)}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
