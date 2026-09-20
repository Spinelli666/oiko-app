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
import type { EvolutionPoint, Granularity } from "@/lib/evolution";

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

function formatBucketLabel(date: Date, granularity: Granularity) {
  switch (granularity) {
    case "diario":
    case "semanal":
      return DAY_LABEL_FORMATTER.format(date);
    case "mensal":
      return MONTH_LABEL_FORMATTER.format(date);
    case "anual":
      return YEAR_LABEL_FORMATTER.format(date);
  }
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function EvolutionChart({
  data,
  granularity,
}: {
  data: EvolutionPoint[];
  granularity: Granularity;
}) {
  const hasData = data.some((d) => d.receitas !== 0 || d.despesas !== 0);

  if (data.length === 0) {
    return (
      <p className="text-text-secondary">
        Escolha um período com data inicial anterior à final.
      </p>
    );
  }

  if (!hasData) {
    return (
      <p className="text-text-secondary">
        Nenhuma transação no período selecionado.
      </p>
    );
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
