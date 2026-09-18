import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

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

        <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
          <p className="text-text-secondary">
            Login funcionando. O dashboard de verdade (saldo do mês, gastos
            por categoria, orçamento) entra na próxima etapa, quando
            categorias e transações tiverem telas de cadastro.
          </p>
        </div>
      </div>
    </div>
  );
}
