"use client";

import { useActionState } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { computeBudgetStatus } from "@/lib/budget-status";
import { removeBudgetAction, setBudgetAction } from "./actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function BudgetRow({
  category,
  budgetId,
  limitAmount,
  spentAmount,
}: {
  category: CategoryModel;
  budgetId?: string;
  limitAmount?: number;
  spentAmount: number;
}) {
  const [state, formAction, isPending] = useActionState(
    setBudgetAction,
    undefined
  );

  const { isOverBudget, isNearLimit, percentage } = computeBudgetStatus(
    spentAmount,
    limitAmount
  );
  const statusColor = isOverBudget
    ? "text-alert"
    : isNearLimit
      ? "text-accent"
      : "text-text-secondary";

  return (
    <li className="flex flex-col gap-2 border-b border-text-secondary/10 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <span className="font-medium">{category.name}</span>
        <span className={statusColor}>
          {currencyFormatter.format(spentAmount)}
          {limitAmount !== undefined &&
            ` de ${currencyFormatter.format(limitAmount)}`}
        </span>
      </div>

      {percentage !== null && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-background">
          <div
            className={`h-full ${
              isOverBudget ? "bg-alert" : isNearLimit ? "bg-accent" : "bg-primary"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="categoryId" value={category.id} />
          <input
            name="limitAmount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="Definir limite"
            defaultValue={limitAmount}
            className="w-36 rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90 active:scale-95 disabled:cursor-default disabled:active:scale-100 disabled:opacity-60"
          >
            Salvar
          </button>
        </form>

        {budgetId && (
          <form action={removeBudgetAction}>
            <input type="hidden" name="id" value={budgetId} />
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-alert/40 px-3 py-1.5 text-sm font-medium text-alert transition hover:bg-alert/10 active:scale-95"
            >
              Remover
            </button>
          </form>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-alert" role="alert">
          {state.error}
        </p>
      )}
    </li>
  );
}
