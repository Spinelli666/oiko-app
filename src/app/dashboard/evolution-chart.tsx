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
import type { MonthlyEvolution } from "@/lib/evolution";

const monthLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function EvolutionChart({ data }: { data: MonthlyEvolution[] }) {
  const hasData = data.some((d) => d.receitas !== 0 || d.despesas !== 0);

  if (!hasData) {
    return (
      <p className="text-text-secondary">
        Nenhuma transação nos últimos meses ainda.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    month: monthLabelFormatter.format(d.monthReference),
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
          <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
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
            type="monotone"
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
