"use client";

import { useState } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { CATEGORY_KIND_LABELS } from "../categorias/category-type-labels";
import { TransactionRow, type TransactionWithCategory } from "./transaction-row";

export function TransactionsList({
  transactions,
  categories,
}: {
  transactions: TransactionWithCategory[];
  categories: CategoryModel[];
}) {
  const [categoryId, setCategoryId] = useState("");

  const filtered = categoryId
    ? transactions.filter((t) => t.categoryId === categoryId)
    : transactions;

  return (
    <>
      <div className="rounded-lg border border-text-secondary/20 bg-surface p-4">
        <label htmlFor="transaction-category-filter" className="sr-only">
          Filtrar por categoria
        </label>
        <select
          id="transaction-category-filter"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({CATEGORY_KIND_LABELS[category.kind]})
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
        {filtered.length === 0 ? (
          <p className="text-text-secondary">
            {transactions.length === 0
              ? "Nenhuma transação lançada neste mês ainda."
              : "Nenhuma transação encontrada para essa categoria."}
          </p>
        ) : (
          <ul>
            {filtered.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                categories={categories}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
