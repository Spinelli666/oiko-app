"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import type { RecurringTransactionGetPayload } from "@/generated/prisma/models/RecurringTransaction";
import {
  deleteRecurringTransactionAction,
  toggleRecurringTransactionAction,
  updateRecurringTransactionAction,
} from "./actions";
import { CATEGORY_KIND_LABELS } from "../categorias/category-type-labels";

export type RecurringTransactionWithCategory = Omit<
  RecurringTransactionGetPayload<{ include: { category: true } }>,
  "amount"
> & { amount: number };

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function RecurringTransactionRow({
  recurringTransaction,
  categories,
}: {
  recurringTransaction: RecurringTransactionWithCategory;
  categories: CategoryModel[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isExpense = recurringTransaction.category.kind === "DESPESA";

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof updateRecurringTransactionAction>>,
      formData: FormData
    ) => {
      const result = await updateRecurringTransactionAction(prevState, formData);
      if (!result?.error) {
        setIsEditing(false);
      }
      return result;
    },
    undefined
  );

  if (isEditing) {
    return (
      <li className="flex flex-col gap-2 border-b border-text-secondary/10 py-3">
        <form action={formAction} className="grid gap-2 sm:grid-cols-2">
          <input type="hidden" name="id" value={recurringTransaction.id} />

          <input
            name="description"
            type="text"
            required
            defaultValue={recurringTransaction.description}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          />

          <select
            name="categoryId"
            required
            defaultValue={recurringTransaction.categoryId}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({CATEGORY_KIND_LABELS[category.kind]})
              </option>
            ))}
          </select>

          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={recurringTransaction.amount}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          />

          <input
            name="startDate"
            type="date"
            required
            defaultValue={recurringTransaction.startDate.toISOString().slice(0, 10)}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          />

          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
        {state?.error && (
          <p className="text-sm text-alert" role="alert">
            {state.error}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 border-b border-text-secondary/10 py-3">
      <div>
        <p
          className={`font-medium ${
            recurringTransaction.isActive ? "" : "text-text-secondary line-through"
          }`}
        >
          {recurringTransaction.description}
        </p>
        <p className="text-sm text-text-secondary">
          {recurringTransaction.category.name} · todo dia{" "}
          {recurringTransaction.startDate.getUTCDate()} · desde{" "}
          {dateFormatter.format(recurringTransaction.startDate)}
          {!recurringTransaction.isActive && " · pausada"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`font-medium ${isExpense ? "text-alert" : "text-success"}`}>
          {isExpense ? "-" : "+"}
          {currencyFormatter.format(recurringTransaction.amount)}
        </span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Editar"
          title="Editar"
          className="flex cursor-pointer items-center justify-center rounded-md border border-text-secondary/30 p-2 transition hover:bg-text-secondary/10 active:scale-90"
        >
          <Image src="/icon-edit.svg" alt="" width={16} height={16} />
        </button>
        <form action={toggleRecurringTransactionAction}>
          <input type="hidden" name="id" value={recurringTransaction.id} />
          <input
            type="hidden"
            name="isActive"
            value={(!recurringTransaction.isActive).toString()}
          />
          <button
            type="submit"
            className="cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
          >
            {recurringTransaction.isActive ? "Pausar" : "Reativar"}
          </button>
        </form>
        <form action={deleteRecurringTransactionAction}>
          <input type="hidden" name="id" value={recurringTransaction.id} />
          <button
            type="submit"
            aria-label="Excluir"
            title="Excluir"
            className="flex cursor-pointer items-center justify-center rounded-md border border-alert/40 p-2 transition hover:bg-alert/10 active:scale-90"
          >
            <Image src="/icon-delete.svg" alt="" width={16} height={16} />
          </button>
        </form>
      </div>
    </li>
  );
}
