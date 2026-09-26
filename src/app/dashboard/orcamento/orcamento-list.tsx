"use client";

import { useState } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { BudgetRow } from "./budget-row";

export type BudgetRowData = {
  category: CategoryModel;
  budgetId?: string;
  limitAmount?: number;
  spentAmount: number;
};

export function OrcamentoList({ rows }: { rows: BudgetRowData[] }) {
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const filtered = term
    ? rows.filter((row) => row.category.name.toLowerCase().includes(term))
    : rows;

  return (
    <>
      <div className="rounded-lg border border-text-secondary/20 bg-surface p-3">
        <label htmlFor="budget-search" className="sr-only">
          Pesquisar categoria
        </label>
        <input
          id="budget-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar categoria..."
          className="w-full rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
        />
      </div>

      <div className="rounded-lg border border-text-secondary/20 bg-surface p-5">
        {filtered.length === 0 ? (
          <p className="text-text-secondary">
            {rows.length === 0
              ? "Nenhuma categoria de despesa ainda."
              : "Nenhuma categoria encontrada."}
          </p>
        ) : (
          <ul className="lg:columns-2 lg:gap-x-6">
            {filtered.map((row) => (
              <BudgetRow
                key={row.category.id}
                category={row.category}
                budgetId={row.budgetId}
                limitAmount={row.limitAmount}
                spentAmount={row.spentAmount}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
