"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import type { CategoryModel } from "@/generated/prisma/models/Category";
import { Dialog } from "@/components/dialog";
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
  isExpanded = false,
  onToggleExpand,
  transactionCount,
  reassignOptions,
}: {
  category: CategoryModel;
  isSubcategory?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
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
            {CATEGORY_TYPE_LABELS[category.type]}
          </p>
        </div>
        <div className="flex gap-2">
          {hasChildren && onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-label={isExpanded ? "Ocultar subcategorias" : "Mostrar subcategorias"}
              title={isExpanded ? "Ocultar subcategorias" : "Mostrar subcategorias"}
              className="rounded-md border border-text-secondary/30 px-2.5 py-1.5 text-sm"
            >
              {isExpanded ? "▾" : "▸"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Editar"
            title="Editar"
            className="flex items-center justify-center rounded-md border border-text-secondary/30 p-2"
          >
            <Image src="/icon-edit.svg" alt="" width={16} height={16} />
          </button>
          {!category.isDefault && (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete((v) => !v)}
              aria-label="Excluir"
              title="Excluir"
              className="flex items-center justify-center rounded-md border border-alert/40 p-2"
            >
              <Image src="/icon-delete.svg" alt="" width={16} height={16} />
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

      {isEditing && (
        <Dialog onClose={() => setIsEditing(false)}>
          <h2 className="mb-4 text-lg font-semibold">Editar categoria</h2>
          <form action={editFormAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={category.id} />

            <div className="flex flex-col gap-1">
              <label htmlFor={`name-${category.id}`} className="text-sm font-medium">
                Nome
              </label>
              <input
                id={`name-${category.id}`}
                name="name"
                type="text"
                required
                defaultValue={category.name}
                className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor={`kind-${category.id}`} className="text-sm font-medium">
                  Tipo
                </label>
                {isSubcategory ? (
                  <>
                    <input type="hidden" name="kind" value={category.kind} />
                    <p className="rounded-md border border-text-secondary/20 bg-background px-3 py-2 text-sm text-text-secondary">
                      {CATEGORY_KIND_LABELS[category.kind]}
                    </p>
                  </>
                ) : (
                  <select
                    id={`kind-${category.id}`}
                    name="kind"
                    defaultValue={category.kind}
                    className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
                  >
                    <option value="DESPESA">Despesa</option>
                    <option value="RECEITA">Receita</option>
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={`type-${category.id}`} className="text-sm font-medium">
                  Classificação
                </label>
                <select
                  id={`type-${category.id}`}
                  name="type"
                  defaultValue={category.type}
                  className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
                >
                  {CATEGORY_TYPE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {editState?.error && (
              <p className="text-sm text-alert" role="alert">
                {editState.error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isEditPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isEditPending ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-md border border-text-secondary/30 px-4 py-2 text-sm font-medium"
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
