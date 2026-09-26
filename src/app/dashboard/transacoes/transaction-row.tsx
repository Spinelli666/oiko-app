"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import type { TransactionGetPayload } from "@/generated/prisma/models/Transaction";
import { Dialog } from "@/components/dialog";
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
  editMode = "inline",
}: {
  transaction: TransactionWithCategory;
  categories: CategoryModel[];
  editMode?: "inline" | "dialog";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const amount = transaction.amount;
  const isExpense = amount < 0;

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

  if (isEditing && editMode === "inline") {
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
              className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90 active:scale-95 disabled:cursor-default disabled:active:scale-100 disabled:opacity-60"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="cursor-pointer rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
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
          {editMode === "inline" && `${transaction.category.name} · `}
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
          aria-label="Editar"
          title="Editar"
          className="flex cursor-pointer items-center justify-center rounded-md border border-text-secondary/30 p-2 transition hover:bg-text-secondary/10 active:scale-90"
        >
          <Image src="/icon-edit.svg" alt="" width={16} height={16} />
        </button>
        <form action={deleteTransactionAction}>
          <input type="hidden" name="id" value={transaction.id} />
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

      {isEditing && editMode === "dialog" && (
        <Dialog onClose={() => setIsEditing(false)}>
          <h2 className="mb-4 text-lg font-semibold">Editar Transação</h2>
          <form action={formAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={transaction.id} />

            <div className="flex flex-col gap-1">
              <label
                htmlFor={`description-${transaction.id}`}
                className="text-sm font-medium"
              >
                Descrição
              </label>
              <input
                id={`description-${transaction.id}`}
                name="description"
                type="text"
                required
                defaultValue={transaction.description}
                className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor={`category-${transaction.id}`}
                className="text-sm font-medium"
              >
                Categoria
              </label>
              <select
                id={`category-${transaction.id}`}
                name="categoryId"
                required
                defaultValue={transaction.categoryId}
                className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({CATEGORY_KIND_LABELS[category.kind]})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`amount-${transaction.id}`}
                  className="text-sm font-medium"
                >
                  Valor
                </label>
                <input
                  id={`amount-${transaction.id}`}
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  defaultValue={Math.abs(amount)}
                  className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`date-${transaction.id}`}
                  className="text-sm font-medium"
                >
                  Data
                </label>
                <input
                  id={`date-${transaction.id}`}
                  name="date"
                  type="date"
                  required
                  defaultValue={transaction.date.toISOString().slice(0, 10)}
                  className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-alert" role="alert">
                {state.error}
              </p>
            )}

            <div className="flex justify-center gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 active:scale-95 disabled:cursor-default disabled:active:scale-100 disabled:opacity-60"
              >
                {isPending ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="cursor-pointer rounded-md border border-text-secondary/30 px-4 py-2 text-sm font-medium transition hover:bg-text-secondary/10 active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </li>
  );
}
