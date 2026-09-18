import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getTransactionsForUser } from "@/lib/transactions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const transactions = await getTransactionsForUser(session.user.id);

  const balance = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const expensesByCategory = new Map<string, number>();
  for (const transaction of transactions) {
    const amount = Number(transaction.amount);
    if (amount >= 0) continue;
    const current = expensesByCategory.get(transaction.category.name) ?? 0;
    expensesByCategory.set(transaction.category.name, current - amount);
  }
  const sortedExpenses = [...expensesByCategory.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="flex flex-1 flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
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

        <div className="flex gap-3">
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
            Gastos por categoria
          </p>
          {sortedExpenses.length === 0 ? (
            <p className="text-text-secondary">
              Nenhuma despesa lançada neste mês ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sortedExpenses.map(([categoryName, total]) => (
                <li
                  key={categoryName}
                  className="flex items-center justify-between"
                >
                  <span>{categoryName}</span>
                  <span className="font-medium text-alert">
                    {currencyFormatter.format(total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
