"use client";

import { useActionState, useRef } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { CategoryPickerField } from "@/components/category-picker-field";
import { todayInAppTimezone } from "@/lib/dates";
import { createBillAction } from "./actions";

export function AddBillForm({ categories }: { categories: CategoryModel[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof createBillAction>>,
      formData: FormData
    ) => {
      const result = await createBillAction(prevState, formData);
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
          <label htmlFor="bill-description" className="text-sm font-medium">
            Descrição
          </label>
          <input
            id="bill-description"
            name="description"
            type="text"
            required
            placeholder="Ex: Fatura do cartão"
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="bill-categoryId" className="text-sm font-medium">
            Categoria
          </label>
          <CategoryPickerField id="bill-categoryId" name="categoryId" categories={categories} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="bill-amount" className="text-sm font-medium">
            Valor
          </label>
          <input
            id="bill-amount"
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
          <label htmlFor="bill-dueDate" className="text-sm font-medium">
            Vencimento
          </label>
          <input
            id="bill-dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={todayInAppTimezone().toISOString().slice(0, 10)}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" name="repeatsMonthly" className="cursor-pointer" />
        Repete todo mês
      </label>

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
        {isPending ? "Salvando..." : "Cadastrar conta"}
      </button>
    </form>
  );
}
