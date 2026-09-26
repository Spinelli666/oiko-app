"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import type { BillGetPayload } from "@/generated/prisma/models/Bill";
import { todayInAppTimezone } from "@/lib/dates";
import {
  deleteBillAction,
  markBillAsPaidAction,
  updateBillAction,
} from "./actions";
import { CATEGORY_KIND_LABELS } from "../categories/category-type-labels";

export type BillWithCategory = Omit<
  BillGetPayload<{ include: { category: true } }>,
  "amount"
> & { amount: number };

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function BillRow({
  bill,
  categories,
}: {
  bill: BillWithCategory;
  categories: CategoryModel[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isExpense = bill.category.kind === "DESPESA";
  const isPending = bill.status === "PENDENTE";
  const isOverdue = isPending && bill.dueDate < todayInAppTimezone();

  const [state, formAction, isSubmitting] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof updateBillAction>>,
      formData: FormData
    ) => {
      const result = await updateBillAction(prevState, formData);
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
          <input type="hidden" name="id" value={bill.id} />

          <input
            name="description"
            type="text"
            required
            defaultValue={bill.description}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          />

          <select
            name="categoryId"
            required
            defaultValue={bill.categoryId}
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
            defaultValue={bill.amount}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          />

          <input
            name="dueDate"
            type="date"
            required
            defaultValue={bill.dueDate.toISOString().slice(0, 10)}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="repeatsMonthly"
              defaultChecked={bill.repeatsMonthly}
              className="cursor-pointer"
            />
            Repete todo mês
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
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
        <p className={`font-medium ${bill.status === "PAGA" ? "text-text-secondary line-through" : ""}`}>
          {bill.description}
        </p>
        <p className={`text-sm ${isOverdue ? "text-alert" : "text-text-secondary"}`}>
          {bill.category.name} · vence em {dateFormatter.format(bill.dueDate)}
          {isOverdue && " · vencida"}
          {bill.status === "PAGA" && " · paga"}
          {bill.repeatsMonthly && " · repete todo mês"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`font-medium ${isExpense ? "text-alert" : "text-success"}`}>
          {isExpense ? "-" : "+"}
          {currencyFormatter.format(bill.amount)}
        </span>
        {isPending && (
          <form action={markBillAsPaidAction}>
            <input type="hidden" name="id" value={bill.id} />
            <button
              type="submit"
              className="cursor-pointer rounded-md border border-success/40 px-3 py-1.5 text-sm font-medium text-success transition hover:bg-success/10 active:scale-95"
            >
              Marcar como paga
            </button>
          </form>
        )}
        {isPending && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Editar"
            title="Editar"
            className="flex cursor-pointer items-center justify-center rounded-md border border-text-secondary/30 p-2 transition hover:bg-text-secondary/10 active:scale-90"
          >
            <Image src="/icon-edit.svg" alt="" width={16} height={16} />
          </button>
        )}
        <form action={deleteBillAction}>
          <input type="hidden" name="id" value={bill.id} />
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
