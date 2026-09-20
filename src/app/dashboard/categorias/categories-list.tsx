"use client";

import { useState } from "react";
import type { CategoryWithChildren } from "@/lib/categories";
import { CategoryGroup } from "./category-group";

export function CategoriesList({
  receitas,
  despesas,
  transactionCounts,
  reassignOptionsByCategory,
  children,
}: {
  receitas: CategoryWithChildren[];
  despesas: CategoryWithChildren[];
  transactionCounts: Map<string, number>;
  reassignOptionsByCategory: Map<string, Array<{ id: string; name: string }>>;
  children?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  const matches = (category: CategoryWithChildren) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    if (category.name.toLowerCase().includes(term)) return true;
    return category.children.some((child) =>
      child.name.toLowerCase().includes(term)
    );
  };

  const filteredReceitas = receitas.filter(matches);
  const filteredDespesas = despesas.filter(matches);

  return (
    <>
      <div className="rounded-lg border border-text-secondary/20 bg-surface p-4">
        <label htmlFor="category-search" className="sr-only">
          Pesquisar categorias
        </label>
        <input
          id="category-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar categoria ou subcategoria..."
          className="w-full rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
        />
      </div>

      {children}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
          <h2 className="mb-3 text-lg font-semibold">Receitas</h2>
          {filteredReceitas.length === 0 ? (
            <p className="text-text-secondary">
              {receitas.length === 0
                ? "Nenhuma categoria de receita ainda."
                : "Nenhuma categoria encontrada."}
            </p>
          ) : (
            <ul>
              {filteredReceitas.map((category) => (
                <CategoryGroup
                  key={category.id}
                  category={category}
                  transactionCounts={transactionCounts}
                  reassignOptionsByCategory={reassignOptionsByCategory}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
          <h2 className="mb-3 text-lg font-semibold">Despesas</h2>
          {filteredDespesas.length === 0 ? (
            <p className="text-text-secondary">
              {despesas.length === 0
                ? "Nenhuma categoria de despesa ainda."
                : "Nenhuma categoria encontrada."}
            </p>
          ) : (
            <ul>
              {filteredDespesas.map((category) => (
                <CategoryGroup
                  key={category.id}
                  category={category}
                  transactionCounts={transactionCounts}
                  reassignOptionsByCategory={reassignOptionsByCategory}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
