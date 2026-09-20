"use client";

import { useState } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { AddTransactionForm } from "./add-transaction-form";
import { AddRecurringTransactionForm } from "./add-recurring-transaction-form";
import { RecurringTransactionList } from "./recurring-transaction-list";
import type { RecurringTransactionWithCategory } from "./recurring-transaction-row";

type Tab = "unica" | "recorrente";

export function TransactionFormTabs({
  categories,
  monthReference,
  recurringTransactions,
}: {
  categories: CategoryModel[];
  monthReference?: Date;
  recurringTransactions: RecurringTransactionWithCategory[];
}) {
  const [tab, setTab] = useState<Tab>("unica");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("unica")}
          className={
            tab === "unica"
              ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white"
              : "rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium"
          }
        >
          Transação única
        </button>
        <button
          type="button"
          onClick={() => setTab("recorrente")}
          className={
            tab === "recorrente"
              ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white"
              : "rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium"
          }
        >
          Recorrente
        </button>
      </div>

      {tab === "unica" ? (
        <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
          <AddTransactionForm categories={categories} monthReference={monthReference} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
            <AddRecurringTransactionForm categories={categories} />
          </div>
          <RecurringTransactionList
            recurringTransactions={recurringTransactions}
            categories={categories}
          />
        </div>
      )}
    </div>
  );
}
