"use client";

import { useMemo, useState } from "react";
import {
  bucketsInRange,
  computeEvolution,
  computeEvolutionByCategory,
  defaultRangeFor,
  type Granularity,
} from "@/lib/evolution";
import { EvolutionChart, type EvolutionCategory } from "./evolution-chart";

const GRANULARITY_OPTIONS: Array<{ value: Granularity; label: string }> = [
  { value: "diario", label: "Diário" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
  { value: "anual", label: "Anual" },
];

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function EvolutionSection({
  transactions,
  categories,
}: {
  transactions: Array<{ date: Date; amount: number; categoryId: string }>;
  categories: EvolutionCategory[];
}) {
  const [granularity, setGranularity] = useState<Granularity>("mensal");
  const [viewMode, setViewMode] = useState<"total" | "categorias">("total");
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  const [rangeError, setRangeError] = useState<string | null>(null);

  // No "Diário" a divisão por categoria é a única forma exibida: um total
  // agregado por dia teria pouco valor, e o volume de barras é pequeno o
  // suficiente para caber lado a lado.
  const effectiveViewMode = granularity === "diario" ? "categorias" : viewMode;

  const range = customRange ?? defaultRangeFor(granularity);

  const buckets = useMemo(
    () => bucketsInRange(range.from, range.to, granularity),
    [range, granularity]
  );

  const data = useMemo(
    () => computeEvolution(transactions, buckets, granularity),
    [transactions, buckets, granularity]
  );

  const categoryData = useMemo(
    () => computeEvolutionByCategory(transactions, buckets, granularity),
    [transactions, buckets, granularity]
  );

  function selectGranularity(next: Granularity) {
    setGranularity(next);
    setCustomRange(null);
    setRangeError(null);
  }

  function handleCustomRangeSubmit(formData: FormData) {
    const fromValue = String(formData.get("from") ?? "");
    const toValue = String(formData.get("to") ?? "");
    if (!fromValue || !toValue) return;

    const from = parseDateInputValue(fromValue);
    const to = parseDateInputValue(toValue);

    if (from.getTime() > to.getTime()) {
      setRangeError("A data inicial precisa ser antes da data final.");
      return;
    }

    setRangeError(null);
    setCustomRange({ from, to });
  }

  const formKey = `${granularity}:${
    customRange
      ? `${customRange.from.getTime()}-${customRange.to.getTime()}`
      : "default"
  }`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {GRANULARITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => selectGranularity(option.value)}
            className={
              granularity === option.value && !customRange
                ? "cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition active:scale-95"
                : "cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {granularity !== "diario" && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("total")}
            className={
              viewMode === "total"
                ? "cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition active:scale-95"
                : "cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
            }
          >
            Total
          </button>
          <button
            type="button"
            onClick={() => setViewMode("categorias")}
            className={
              viewMode === "categorias"
                ? "cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition active:scale-95"
                : "cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
            }
          >
            Por categoria
          </button>
        </div>
      )}

      <form
        key={formKey}
        action={handleCustomRangeSubmit}
        className="flex flex-wrap items-end gap-2"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="evolution-from" className="text-xs text-text-secondary">
            De
          </label>
          <input
            id="evolution-from"
            name="from"
            type="date"
            defaultValue={toDateInputValue(range.from)}
            className="rounded-md border border-text-secondary/30 bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="evolution-to" className="text-xs text-text-secondary">
            Até
          </label>
          <input
            id="evolution-to"
            name="to"
            type="date"
            defaultValue={toDateInputValue(range.to)}
            className="rounded-md border border-text-secondary/30 bg-surface px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
        >
          Filtrar
        </button>
        {customRange && (
          <button
            type="button"
            onClick={() => {
              setCustomRange(null);
              setRangeError(null);
            }}
            className="cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
          >
            Limpar período
          </button>
        )}
      </form>

      {rangeError && (
        <p className="text-sm text-alert" role="alert">
          {rangeError}
        </p>
      )}

      <EvolutionChart
        data={data}
        granularity={granularity}
        viewMode={effectiveViewMode}
        categoryData={categoryData}
        categories={categories}
      />
    </div>
  );
}
