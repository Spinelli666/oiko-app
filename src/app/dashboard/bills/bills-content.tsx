import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBillsForUser } from "@/lib/bills";
import { getCategoriesForUser } from "@/lib/categories";
import { AddBillForm } from "./add-bill-form";
import { BillList } from "./bill-list";

export async function BillsContent() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [categories, bills] = await Promise.all([
    getCategoriesForUser(session.user.id),
    getBillsForUser(session.user.id),
  ]);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold sm:text-2xl">Contas a pagar</h1>
        <p className="text-text-secondary">
          Você precisa criar pelo menos uma categoria antes de cadastrar uma
          conta a pagar.
        </p>
        <Link
          href="/dashboard/categories"
          className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Criar categoria
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold sm:text-2xl">Contas a pagar</h1>

      <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
        <AddBillForm categories={categories} />
      </div>

      <BillList
        bills={bills.map((bill) => ({ ...bill, amount: Number(bill.amount) }))}
        categories={categories}
      />
    </div>
  );
}
