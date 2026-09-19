import type { BudgetAlert } from "@/lib/budget-status";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function BudgetAlertBanner({ alerts }: { alerts: BudgetAlert[] }) {
  if (alerts.length === 0) return null;

  const hasOverBudget = alerts.some((a) => a.severity === "over");

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-4 ${
        hasOverBudget
          ? "border-alert/40 bg-alert/10"
          : "border-accent/40 bg-accent/10"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          hasOverBudget ? "text-alert" : "text-accent"
        }`}
      >
        Alertas de orçamento
      </p>
      <ul className="flex flex-col gap-1 text-sm">
        {alerts.map((alert) => (
          <li
            key={alert.categoryId}
            className={alert.severity === "over" ? "text-alert" : "text-accent"}
          >
            {alert.categoryName}: {currencyFormatter.format(alert.spentAmount)}{" "}
            de {currencyFormatter.format(alert.limitAmount)} ({alert.percentage}
            %) —{" "}
            {alert.severity === "over"
              ? "orçamento ultrapassado"
              : "perto do limite"}
          </li>
        ))}
      </ul>
    </div>
  );
}
