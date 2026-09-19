"use client";

import { useActionState, useState } from "react";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { deleteCategoryAction, updateCategoryAction } from "./actions";
import {
  CATEGORY_KIND_LABELS,
  CATEGORY_TYPE_LABELS,
  CATEGORY_TYPE_OPTIONS,
} from "./category-type-labels";

export function CategoryRow({
  category,
  isSubcategory = false,
  hasChildren = false,
  transactionCount,
  reassignOptions,
}: {
  category: CategoryModel;
  isSubcategory?: boolean;
  hasChildren?: boolean;
  transactionCount: number;
  reassignOptions: Array<{ id: string; name: string }>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const [editState, editFormAction, isEditPending] = useActionState(
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

  const [deleteState, deleteFormAction, isDeletePending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof deleteCategoryAction>>,
      formData: FormData
    ) => {
      const result = await deleteCategoryAction(prevState, formData);
      if (!result?.error) {
        setIsConfirmingDelete(false);
      }
      return result;
    },
    undefined
  );

  const rowPadding = isSubcategory ? "py-2 pl-8" : "py-3";

  if (isEditing) {
    return (
      <li className={`flex flex-col gap-2 border-b border-text-secondary/10 ${rowPadding}`}>
        <form
          action={editFormAction}
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
          {isSubcategory ? (
            <input type="hidden" name="kind" value={category.kind} />
          ) : (
            <select
              name="kind"
              defaultValue={category.kind}
              className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 outline-none focus:border-primary"
            >
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
            </select>
          )}
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
              disabled={isEditPending}
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
        {editState?.error && (
          <p className="text-sm text-alert" role="alert">
            {editState.error}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className={`flex flex-col gap-2 border-b border-text-secondary/10 ${rowPadding}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            {category.name}
            {category.isDefault && (
              <span className="ml-2 rounded-full bg-text-secondary/10 px-2 py-0.5 text-xs font-normal text-text-secondary">
                Padrão
              </span>
            )}
          </p>
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
          {!category.isDefault && (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete((v) => !v)}
              className="rounded-md border border-alert/40 px-3 py-1.5 text-sm font-medium text-alert"
            >
              Excluir
            </button>
          )}
        </div>
      </div>

      {isConfirmingDelete && !category.isDefault && (
        <div className="rounded-md border border-alert/30 bg-alert/5 p-3">
          {hasChildren ? (
            <p className="text-sm text-alert">
              Esta categoria tem subcategorias. Exclua ou mova as
              subcategorias primeiro.
            </p>
          ) : (
            <form action={deleteFormAction} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={category.id} />
              {transactionCount > 0 && (
                <>
                  <p className="text-sm">
                    Essa categoria tem {transactionCount}{" "}
                    {transactionCount === 1 ? "transação" : "transações"}.
                    Para qual categoria elas devem ir?
                  </p>
                  <select
                    name="reassignToId"
                    required
                    defaultValue=""
                    className="rounded-md border border-text-secondary/30 bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="" disabled>
                      Selecione uma categoria
                    </option>
                    {reassignOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isDeletePending}
                  className="w-fit rounded-md bg-alert px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {isDeletePending ? "Excluindo..." : "Confirmar exclusão"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="w-fit rounded-md border border-text-secondary/30 px-3 py-1.5 text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
          {deleteState?.error && (
            <p className="mt-2 text-sm text-alert" role="alert">
              {deleteState.error}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
