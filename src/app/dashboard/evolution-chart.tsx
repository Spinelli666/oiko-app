"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { categoryColorVarByIndex } from "@/lib/category-colors";
import type { EvolutionPoint, Granularity } from "@/lib/evolution";

export type EvolutionCategory = {
  id: string;
  name: string;
  kind: "RECEITA" | "DESPESA";
};

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

const YEAR_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  year: "numeric",
  timeZone: "UTC",
});

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatBucketLabel(date: Date, granularity: Granularity) {
  switch (granularity) {
    case "diario":
    case "semanal":
      return DAY_LABEL_FORMATTER.format(date);
    case "mensal":
      return capitalize(MONTH_LABEL_FORMATTER.format(date));
    case "anual":
      return YEAR_LABEL_FORMATTER.format(date);
  }
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function EmptyState({ message }: { message: string }) {
  return <p className="text-text-secondary">{message}</p>;
}

type TooltipPayloadEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
};

/** Same look as the default recharts tooltip, but hides categories with no
 * activity in that bucket instead of listing every category every time. */
function CategoryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const visible = payload.filter(
    (entry) => entry.dataKey === "Saldo" || Number(entry.value) !== 0
  );
  if (visible.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--text-secondary)",
        borderRadius: 8,
        padding: "8px 12px",
      }}
    >
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{label}</p>
      {visible.map((entry) => (
        <p key={String(entry.dataKey)} style={{ margin: 0, color: entry.color }}>
          {entry.name} : {currencyFormatter.format(Number(entry.value))}
        </p>
      ))}
    </div>
  );
}

export function EvolutionChart({
  data,
  granularity,
  viewMode,
  categoryData,
  categories,
}: {
  data: EvolutionPoint[];
  granularity: Granularity;
  viewMode: "total" | "categorias";
  categoryData: Array<{ bucketStart: Date; totals: Map<string, number> }>;
  categories: EvolutionCategory[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState message="Escolha um período com data inicial anterior à final." />
    );
  }

  if (viewMode === "categorias") {
    // Only categories with activity somewhere in the visible range get a
    // slot in the palette, ordered by total desc, so the most relevant
    // categories get the first (most distinct) colors.
    const totalByCategory = new Map<string, number>();
    for (const point of categoryData) {
      for (const [categoryId, amount] of point.totals) {
        totalByCategory.set(
          categoryId,
          (totalByCategory.get(categoryId) ?? 0) + Math.abs(amount)
        );
      }
    }

    const despesaCategories = categories
      .filter((c) => c.kind === "DESPESA" && (totalByCategory.get(c.id) ?? 0) > 0)
      .sort((a, b) => (totalByCategory.get(b.id) ?? 0) - (totalByCategory.get(a.id) ?? 0));
    const receitaCategories = categories
      .filter((c) => c.kind === "RECEITA" && (totalByCategory.get(c.id) ?? 0) > 0)
      .sort((a, b) => (totalByCategory.get(b.id) ?? 0) - (totalByCategory.get(a.id) ?? 0));

    if (despesaCategories.length === 0 && receitaCategories.length === 0) {
      return (
        <EmptyState message="Nenhuma transação no período selecionado." />
      );
    }

    // Semanal/mensal/anual: uma coluna de despesas e uma de receitas por
    // bucket, cada uma empilhada por categoria. Diário: colunas separadas
    // (sem empilhar) para cada categoria, já que o volume por dia é menor.
    const stacked = granularity !== "diario";

    const chartData = data.map((point, index) => {
      const totals = categoryData[index]?.totals ?? new Map<string, number>();
      const row: Record<string, string | number> = {
        label: formatBucketLabel(point.bucketStart, granularity),
        Saldo: point.saldo,
      };
      for (const category of despesaCategories) {
        row[category.id] = Math.abs(totals.get(category.id) ?? 0);
      }
      for (const category of receitaCategories) {
        row[category.id] = Math.abs(totals.get(category.id) ?? 0);
      }
      return row;
    });

    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--text-secondary)"
              strokeOpacity={0.15}
            />
            <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={12} />
            <YAxis
              stroke="var(--text-secondary)"
              fontSize={12}
              width={90}
              tickFormatter={(value) => currencyFormatter.format(Number(value))}
            />
            <Tooltip content={<CategoryTooltip />} />
            <Legend />
            {despesaCategories.map((category, index) => (
              <Bar
                key={category.id}
                dataKey={category.id}
                name={category.name}
                stackId={stacked ? "despesas" : undefined}
                fill={categoryColorVarByIndex(index, true)}
                radius={stacked ? undefined : [4, 4, 0, 0]}
              />
            ))}
            {receitaCategories.map((category, index) => (
              <Bar
                key={category.id}
                dataKey={category.id}
                name={category.name}
                stackId={stacked ? "receitas" : undefined}
                fill={categoryColorVarByIndex(index, false)}
                radius={stacked ? undefined : [4, 4, 0, 0]}
              />
            ))}
            <Line
              type="linear"
              dataKey="Saldo"
              stroke="var(--primary)"
              strokeWidth={2}
              dot
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const hasData = data.some((d) => d.receitas !== 0 || d.despesas !== 0);
  if (!hasData) {
    return <EmptyState message="Nenhuma transação no período selecionado." />;
  }

  const chartData = data.map((d) => ({
    label: formatBucketLabel(d.bucketStart, granularity),
    Receitas: d.receitas,
    Despesas: d.despesas,
    Saldo: d.saldo,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--text-secondary)"
            strokeOpacity={0.15}
          />
          <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={12} />
          <YAxis
            stroke="var(--text-secondary)"
            fontSize={12}
            width={90}
            tickFormatter={(value) => currencyFormatter.format(Number(value))}
          />
          <Tooltip
            formatter={(value) => currencyFormatter.format(Number(value))}
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--text-secondary)",
              borderRadius: 8,
            }}
          />
          <Legend />
          <Bar dataKey="Receitas" fill="var(--success)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Despesas" fill="var(--alert)" radius={[4, 4, 0, 0]} />
          <Line
            type="linear"
            dataKey="Saldo"
            stroke="var(--primary)"
            strokeWidth={2}
            dot
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
