"use client";

import { useActionState, useRef } from "react";
import { createCategoryAction } from "./actions";
import {
  CATEGORY_KIND_OPTIONS,
  CATEGORY_TYPE_OPTIONS,
} from "./category-type-labels";
import type { CategoryKind } from "@/generated/prisma/enums";

export function AddCategoryForm({
  parent,
  onDone,
}: {
  /** When set, the form creates a subcategory locked to the parent's kind. */
  parent?: { id: string; name: string; kind: CategoryKind };
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof createCategoryAction>>,
      formData: FormData
    ) => {
      const result = await createCategoryAction(prevState, formData);
      if (!result?.error) {
        formRef.current?.reset();
        onDone?.();
      }
      return result;
    },
    undefined
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {parent && <input type="hidden" name="parentId" value={parent.id} />}
      <div className={`grid gap-3 ${parent ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            {parent ? `Subcategoria de ${parent.name}` : "Nova categoria"}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder={parent ? "Ex: Supermercado" : "Ex: Alimentação"}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        {parent ? (
          <input type="hidden" name="kind" value={parent.kind} />
        ) : (
          <div className="flex flex-col gap-1">
            <label htmlFor="kind" className="text-sm font-medium">
              Tipo
            </label>
            <select
              id="kind"
              name="kind"
              required
              defaultValue="DESPESA"
              className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
            >
              {CATEGORY_KIND_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="type" className="text-sm font-medium">
            Classificação
          </label>
          <select
            id="type"
            name="type"
            required
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

      {state?.error && (
        <p className="text-sm text-alert" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Adicionando..." : "Adicionar"}
        </button>
        {parent && (
          <button
            type="button"
            onClick={onDone}
            className="w-fit rounded-md border border-text-secondary/30 px-4 py-2 font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
