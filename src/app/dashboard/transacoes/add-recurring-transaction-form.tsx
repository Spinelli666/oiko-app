"use client";

import { useActionState, useRef } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { CurrencyInput } from "@/components/currency-input";
import { todayInAppTimezone } from "@/lib/dates";
import { createRecurringTransactionAction } from "./actions";
import { CATEGORY_KIND_LABELS } from "../categorias/category-type-labels";

export function AddRecurringTransactionForm({
  categories,
}: {
  categories: CategoryModel[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof createRecurringTransactionAction>>,
      formData: FormData
    ) => {
      const result = await createRecurringTransactionAction(prevState, formData);
      if (!result?.error) {
        formRef.current?.reset();
      }
      return result;
    },
    undefined
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium">
            Descrição
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            placeholder="Ex: Aluguel"
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className="text-sm font-medium">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({CATEGORY_KIND_LABELS[category.kind]})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="text-sm font-medium">
            Valor
          </label>
          <CurrencyInput
            id="amount"
            name="amount"
            required
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="text-sm font-medium">
            Data de início
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={todayInAppTimezone().toISOString().slice(0, 10)}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>
      </div>

      <p className="text-xs text-text-secondary">
        Será lançada automaticamente todo mês, no mesmo dia escolhido acima
        (ajustada para o último dia do mês quando ele tiver menos dias).
      </p>

      {state?.error && (
        <p className="text-sm text-alert" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 active:scale-95 disabled:cursor-default disabled:active:scale-100 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Cadastrar recorrência"}
      </button>
    </form>
  );
}
