"use client";

import { useMemo, useState } from "react";
import {
  bucketsInRange,
  computeEvolution,
  defaultRangeFor,
  type Granularity,
} from "@/lib/evolution";
import { EvolutionChart } from "./evolution-chart";

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
}: {
  transactions: Array<{ date: Date; amount: number }>;
}) {
  const [granularity, setGranularity] = useState<Granularity>("mensal");
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  const [rangeError, setRangeError] = useState<string | null>(null);

  const range = customRange ?? defaultRangeFor(granularity);

  const data = useMemo(() => {
    const buckets = bucketsInRange(range.from, range.to, granularity);
    return computeEvolution(transactions, buckets, granularity);
  }, [transactions, range, granularity]);

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
                ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium"
            }
          >
            {option.label}
          </button>
        ))}
      </div>

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
          className="rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium"
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
            className="rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium"
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

      <EvolutionChart data={data} granularity={granularity} />
    </div>
  );
}
