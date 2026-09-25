"use client";

import { useState } from "react";
import Image from "next/image";

export type BreakdownTransaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
};

export type BreakdownNode = {
  categoryId: string;
  name: string;
  total: number;
  limit?: number;
  transactions: BreakdownTransaction[];
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

function CategoryBreakdownList({
  nodes,
  isExpense,
}: {
  nodes: BreakdownNode[];
  isExpense: boolean;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const maxTotal = Math.max(1, ...nodes.map((n) => n.total));
  const amountColor = isExpense ? "text-alert" : "text-success";
  const barColor = isExpense ? "bg-alert" : "bg-success";
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
      {nodes.map((node) => {
        const isExpanded = expandedIds.has(node.categoryId);
        return (
          <li key={node.categoryId} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
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
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${(node.total / maxTotal) * 100}%` }}
              />
            </div>

            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <ul className="flex min-h-0 flex-col gap-2 pl-6 pt-2">
                {node.transactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm text-text-secondary">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-text-secondary/70">
                        {dateFormatter.format(new Date(transaction.date))}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${amountColor}`}>
                      {sign}
                      {currencyFormatter.format(transaction.amount)}
                    </span>
                  </li>
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
}: {
  income: BreakdownNode[];
  expenses: BreakdownNode[];
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
              <CategoryBreakdownList nodes={income} isExpense={false} />
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
              <CategoryBreakdownList nodes={expenses} isExpense={true} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
