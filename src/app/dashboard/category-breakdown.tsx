"use client";

import { useState } from "react";
import Image from "next/image";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { categoryColorByIndex } from "@/lib/category-colors";
import { TransactionRow, type TransactionWithCategory } from "./transacoes/transaction-row";

export type BreakdownNode = {
  categoryId: string;
  name: string;
  total: number;
  limit?: number;
  transactions: TransactionWithCategory[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function CategoryBreakdownList({
  nodes,
  isExpense,
  categories,
}: {
  nodes: BreakdownNode[];
  isExpense: boolean;
  categories: CategoryModel[];
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const maxTotal = Math.max(1, ...nodes.map((n) => n.total));
  const amountColor = isExpense ? "text-alert" : "text-success";
  const sign = isExpense ? "-" : "+";

  function toggle(categoryId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  return (
    <ul className="flex flex-col gap-3">
      {nodes.map((node, index) => {
        const isExpanded = expandedIds.has(node.categoryId);
        const colorClass = categoryColorByIndex(index, isExpense);
        return (
          <li key={node.categoryId} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(node.categoryId)}
                  aria-label="Lançamentos"
                  title="Lançamentos"
                  className="flex cursor-pointer items-center justify-center rounded-md p-1 transition hover:bg-text-secondary/10 active:scale-90"
                >
                  <Image
                    src="/icon-chevron.svg"
                    alt=""
                    width={14}
                    height={14}
                    className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorClass}`}
                />
                <span>{node.name}</span>
              </div>
              <span className={`font-medium ${amountColor}`}>
                {sign}
                {currencyFormatter.format(node.total)}
                {isExpense && node.limit !== undefined && (
                  <span className="font-normal text-text-secondary">
                    {" "}
                    / {currencyFormatter.format(node.limit)}
                  </span>
                )}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-text-secondary/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
                style={{ width: `${(node.total / maxTotal) * 100}%` }}
              />
            </div>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <ul className="flex min-h-0 flex-col pl-6 pt-2">
                {node.transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    categories={categories}
                    editMode="dialog"
                  />
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

type Filter = "receitas" | "despesas" | null;

export function CategoryBreakdown({
  income,
  expenses,
  categories,
}: {
  income: BreakdownNode[];
  expenses: BreakdownNode[];
  categories: CategoryModel[];
}) {
  const [filter, setFilter] = useState<Filter>(null);

  const showReceitas = filter !== "despesas";
  const showDespesas = filter !== "receitas";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter((f) => (f === "receitas" ? null : "receitas"))}
          className={
            filter === "receitas"
              ? "cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition active:scale-95"
              : "cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
          }
        >
          Receitas
        </button>
        <button
          type="button"
          onClick={() => setFilter((f) => (f === "despesas" ? null : "despesas"))}
          className={
            filter === "despesas"
              ? "cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition active:scale-95"
              : "cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
          }
        >
          Despesas
        </button>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${
          showReceitas && showDespesas ? "lg:grid-cols-2" : ""
        }`}
      >
        {showReceitas && (
          <div className="animate-fade-in rounded-lg border border-text-secondary/20 bg-surface p-6">
            <p className="mb-3 text-sm font-medium text-text-secondary">
              Receitas por categoria
            </p>
            {income.length === 0 ? (
              <p className="text-text-secondary">
                Nenhuma receita lançada neste mês ainda.
              </p>
            ) : (
              <CategoryBreakdownList
                nodes={income}
                isExpense={false}
                categories={categories}
              />
            )}
          </div>
        )}

        {showDespesas && (
          <div className="animate-fade-in rounded-lg border border-text-secondary/20 bg-surface p-6">
            <p className="mb-3 text-sm font-medium text-text-secondary">
              Despesas por categoria
            </p>
            {expenses.length === 0 ? (
              <p className="text-text-secondary">
                Nenhuma despesa lançada neste mês ainda.
              </p>
            ) : (
              <CategoryBreakdownList
                nodes={expenses}
                isExpense={true}
                categories={categories}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
