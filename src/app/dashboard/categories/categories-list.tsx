"use client";

import { useState } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { CategoryRow } from "./category-row";

export function CategoriesList({
  receitas,
  despesas,
  transactionCounts,
  reassignOptionsByCategory,
  children,
}: {
  receitas: CategoryModel[];
  despesas: CategoryModel[];
  transactionCounts: Map<string, number>;
  reassignOptionsByCategory: Map<string, Array<{ id: string; name: string }>>;
  children?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  const matches = (category: CategoryModel) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return category.name.toLowerCase().includes(term);
  };

  const filteredReceitas = receitas.filter(matches);
  const filteredDespesas = despesas.filter(matches);

  return (
    <>
      <div className="rounded-lg border border-text-secondary/20 bg-surface p-3">
        <label htmlFor="category-search" className="sr-only">
          Pesquisar categorias
        </label>
        <input
          id="category-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar categoria..."
          className="w-full rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
        />
      </div>

      {children}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-text-secondary/20 bg-surface p-5">
          <h2 className="mb-3 text-lg font-semibold">Receitas</h2>
          {filteredReceitas.length === 0 ? (
            <p className="text-text-secondary">
              {receitas.length === 0
                ? "Nenhuma categoria de receita ainda."
                : "Nenhuma categoria encontrada."}
            </p>
          ) : (
            <ul className="lg:columns-2 lg:gap-x-6">
              {filteredReceitas.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  transactionCount={transactionCounts.get(category.id) ?? 0}
                  reassignOptions={reassignOptionsByCategory.get(category.id) ?? []}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-text-secondary/20 bg-surface p-5">
          <h2 className="mb-3 text-lg font-semibold">Despesas</h2>
          {filteredDespesas.length === 0 ? (
            <p className="text-text-secondary">
              {despesas.length === 0
                ? "Nenhuma categoria de despesa ainda."
                : "Nenhuma categoria encontrada."}
            </p>
          ) : (
            <ul className="lg:columns-2 lg:gap-x-6">
              {filteredDespesas.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  transactionCount={transactionCounts.get(category.id) ?? 0}
                  reassignOptions={reassignOptionsByCategory.get(category.id) ?? []}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
