import type { CategoryModel } from "@/generated/prisma/models/Category";
import {
  RecurringTransactionRow,
  type RecurringTransactionWithCategory,
} from "./recurring-transaction-row";

export function RecurringTransactionList({
  recurringTransactions,
  categories,
}: {
  recurringTransactions: RecurringTransactionWithCategory[];
  categories: CategoryModel[];
}) {
  return (
    <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
      {recurringTransactions.length === 0 ? (
        <p className="text-text-secondary">
          Nenhuma transação recorrente cadastrada ainda.
        </p>
      ) : (
        <ul>
          {recurringTransactions.map((recurringTransaction) => (
            <RecurringTransactionRow
              key={recurringTransaction.id}
              recurringTransaction={recurringTransaction}
              categories={categories}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
