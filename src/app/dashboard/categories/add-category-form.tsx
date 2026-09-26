"use client";

import { useActionState, useRef } from "react";
import { createCategoryAction } from "./actions";
import { CATEGORY_KIND_LABELS, CATEGORY_TYPE_OPTIONS } from "./category-type-labels";
import type { CategoryKind } from "@/generated/prisma/enums";

export function AddCategoryForm({
  kind,
  onDone,
}: {
  kind: CategoryKind;
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            {`Nova categoria de ${CATEGORY_KIND_LABELS[kind].toLowerCase()}`}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Ex: Alimentação"
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        <input type="hidden" name="kind" value={kind} />

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

      <div className="flex justify-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-fit cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 active:scale-95 disabled:cursor-default disabled:active:scale-100 disabled:opacity-60"
        >
          {isPending ? "Adicionando..." : "Adicionar"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="w-fit cursor-pointer rounded-md border border-text-secondary/30 px-4 py-2 font-medium transition hover:bg-text-secondary/10 active:scale-95"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
