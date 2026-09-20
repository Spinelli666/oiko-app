"use client";

import { useActionState, useRef } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { createTransactionAction } from "./actions";
import { CATEGORY_KIND_LABELS } from "../categorias/category-type-labels";

function defaultDateFor(monthReference?: Date) {
  const today = new Date();
  const isCurrentMonth =
    !monthReference ||
    (monthReference.getUTCFullYear() === today.getUTCFullYear() &&
      monthReference.getUTCMonth() === today.getUTCMonth());

  return isCurrentMonth
    ? today.toISOString().slice(0, 10)
    : monthReference.toISOString().slice(0, 10);
}

export function AddTransactionForm({
  categories,
  monthReference,
}: {
  categories: CategoryModel[];
  monthReference?: Date;
}) {
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof createTransactionAction>>,
      formData: FormData
    ) => {
      const result = await createTransactionAction(prevState, formData);
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
            placeholder="Ex: Supermercado"
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
                {category.parentId
                  ? `${categoryNameById.get(category.parentId) ?? ""} > ${category.name}`
                  : category.name}{" "}
                ({CATEGORY_KIND_LABELS[category.kind]})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="text-sm font-medium">
            Valor
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0,00"
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-sm font-medium">
            Data
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaultDateFor(monthReference)}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-alert" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Lançar transação"}
      </button>
    </form>
  );
}
