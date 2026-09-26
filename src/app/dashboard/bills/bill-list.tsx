import type { CategoryModel } from "@/generated/prisma/models/Category";
import { BillRow, type BillWithCategory } from "./bill-row";

export function BillList({
  bills,
  categories,
}: {
  bills: BillWithCategory[];
  categories: CategoryModel[];
}) {
  const pending = bills
    .filter((bill) => bill.status === "PENDENTE")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  const paid = bills
    .filter((bill) => bill.status === "PAGA")
    .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
        <p className="mb-1 text-sm font-medium text-text-secondary">Pendentes</p>
        {pending.length === 0 ? (
          <p className="text-text-secondary">Nenhuma conta pendente.</p>
        ) : (
          <ul>
            {pending.map((bill) => (
              <BillRow key={bill.id} bill={bill} categories={categories} />
            ))}
          </ul>
        )}
      </div>

      {paid.length > 0 && (
        <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
          <p className="mb-1 text-sm font-medium text-text-secondary">Pagas</p>
          <ul>
            {paid.map((bill) => (
              <BillRow key={bill.id} bill={bill} categories={categories} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
