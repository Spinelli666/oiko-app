"use client";

import { useActionState, useState } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import type { TransactionGetPayload } from "@/generated/prisma/models/Transaction";
import { deleteTransactionAction, updateTransactionAction } from "./actions";
import { CATEGORY_KIND_LABELS } from "../categorias/category-type-labels";

export type TransactionWithCategory = Omit<
  TransactionGetPayload<{ include: { category: true } }>,
  "amount"
> & { amount: number };

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function TransactionRow({
  transaction,
  categories,
}: {
  transaction: TransactionWithCategory;
  categories: CategoryModel[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const amount = transaction.amount;
  const isExpense = amount < 0;
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof updateTransactionAction>>,
      formData: FormData
    ) => {
      const result = await updateTransactionAction(prevState, formData);
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
          <input type="hidden" name="id" value={transaction.id} />

          <input
            name="description"
            type="text"
            required
            defaultValue={transaction.description}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          />

          <select
            name="categoryId"
            required
            defaultValue={transaction.categoryId}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
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

          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={Math.abs(amount)}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          />

          <input
            name="date"
            type="date"
            required
            defaultValue={transaction.date.toISOString().slice(0, 10)}
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
        <p className="font-medium">{transaction.description}</p>
        <p className="text-sm text-text-secondary">
          {transaction.category.name} ·{" "}
          {dateFormatter.format(transaction.date)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`font-medium ${isExpense ? "text-alert" : "text-success"}`}
        >
          {isExpense ? "-" : "+"}
          {currencyFormatter.format(Math.abs(amount))}
        </span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium"
        >
          Editar
        </button>
        <form action={deleteTransactionAction}>
          <input type="hidden" name="id" value={transaction.id} />
          <button
            type="submit"
            className="rounded-md border border-alert/40 px-3 py-1.5 text-sm font-medium text-alert"
          >
            Excluir
          </button>
        </form>
      </div>
    </li>
  );
}
