"use client";

import { useActionState, useState } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { deleteCategoryAction, updateCategoryAction } from "./actions";
import {
  CATEGORY_KIND_LABELS,
  CATEGORY_KIND_OPTIONS,
  CATEGORY_TYPE_LABELS,
  CATEGORY_TYPE_OPTIONS,
} from "./category-type-labels";

export function CategoryRow({ category }: { category: CategoryModel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof updateCategoryAction>>,
      formData: FormData
    ) => {
      const result = await updateCategoryAction(prevState, formData);
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
        <form
          action={formAction}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="id" value={category.id} />
          <input
            name="name"
            type="text"
            required
            defaultValue={category.name}
            className="flex-1 rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          />
          <select
            name="kind"
            defaultValue={category.kind}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          >
            {CATEGORY_KIND_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={category.type}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
          >
            {CATEGORY_TYPE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
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
        <p className="font-medium">{category.name}</p>
        <p className="text-sm text-text-secondary">
          {CATEGORY_KIND_LABELS[category.kind]} ·{" "}
          {CATEGORY_TYPE_LABELS[category.type]}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium"
        >
          Editar
        </button>
        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={category.id} />
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
