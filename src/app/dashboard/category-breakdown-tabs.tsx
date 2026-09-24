"use client";

import { useState } from "react";

type IncomeItem = { categoryId: string; name: string; received: number };
type ExpenseItem = { categoryId: string; name: string; spent: number; limit?: number };

type Tab = "receitas" | "despesas";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CategoryBreakdownTabs({
  income,
  expenses,
}: {
  income: IncomeItem[];
  expenses: ExpenseItem[];
}) {
  const [tab, setTab] = useState<Tab>("receitas");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("receitas")}
          className={
            tab === "receitas"
              ? "cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition active:scale-95"
              : "cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
          }
        >
          Receitas
        </button>
        <button
          type="button"
          onClick={() => setTab("despesas")}
          className={
            tab === "despesas"
              ? "cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition active:scale-95"
              : "cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
          }
        >
          Despesas
        </button>
      </div>

      {tab === "receitas" ? (
        <div
          key={tab}
          className="animate-fade-in rounded-lg border border-text-secondary/20 bg-surface p-6"
        >
          <p className="mb-3 text-sm font-medium text-text-secondary">
            Receitas por categoria
          </p>
          {income.length === 0 ? (
            <p className="text-text-secondary">
              Nenhuma receita lançada neste mês ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {income.map(({ categoryId, name, received }) => (
                <li key={categoryId} className="flex items-center justify-between">
                  <span>{name}</span>
                  <span className="font-medium text-success">
                    {currencyFormatter.format(received)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div
          key={tab}
          className="animate-fade-in rounded-lg border border-text-secondary/20 bg-surface p-6"
        >
          <p className="mb-3 text-sm font-medium text-text-secondary">
            Despesas por categoria
          </p>
          {expenses.length === 0 ? (
            <p className="text-text-secondary">
              Nenhuma despesa lançada neste mês ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {expenses.map(({ categoryId, name, spent, limit }) => (
                <li key={categoryId} className="flex items-center justify-between">
                  <span>{name}</span>
                  <span className="font-medium text-alert">
                    {currencyFormatter.format(spent)}
                    {limit !== undefined && (
                      <span className="font-normal text-text-secondary">
                        {" "}
                        / {currencyFormatter.format(limit)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
