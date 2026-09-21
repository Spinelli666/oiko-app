"use client";

import { useActionState, useRef, useState } from "react";
import { Dialog } from "@/components/dialog";
import { createCategoryAction } from "./actions";
import {
  CATEGORY_KIND_LABELS,
  CATEGORY_KIND_OPTIONS,
  CATEGORY_TYPE_OPTIONS,
} from "./category-type-labels";
import type { CategoryKind } from "@/generated/prisma/enums";

type Mode = "categoria" | "subcategoria";

export function AddCategoryForm({
  topLevelCategories,
  onDone,
}: {
  topLevelCategories: Array<{ id: string; name: string; kind: CategoryKind }>;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<Mode>("categoria");
  const [parentId, setParentId] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Awaited<ReturnType<typeof createCategoryAction>>,
      formData: FormData
    ) => {
      const result = await createCategoryAction(prevState, formData);
      if (!result?.error) {
        formRef.current?.reset();
        setMode("categoria");
        setParentId("");
        onDone?.();
      }
      return result;
    },
    undefined
  );

  const isSubcategoria = mode === "subcategoria";
  const selectedParent = topLevelCategories.find((c) => c.id === parentId);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            {isSubcategoria ? "Nome da subcategoria" : "Nova categoria"}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder={isSubcategoria ? "Ex: Supermercado" : "Ex: Alimentação"}
            className="rounded-md border border-text-secondary/30 bg-surface px-3 py-2 outline-none focus:border-primary"
          />
        </div>

        {isSubcategoria ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="parentId" className="text-sm font-medium">
              Categoria
            </label>
            {/* A resolução real do kind é feita no servidor a partir da
                categoria pai escolhida; este campo só existe pra satisfazer
                a validação do formulário. */}
            <input type="hidden" name="kind" value="DESPESA" />
            <input type="hidden" name="parentId" value={parentId} />
            <button
              id="parentId"
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="cursor-pointer rounded-md border border-text-secondary/30 bg-surface px-3 py-2 text-left outline-none focus:border-primary"
            >
              {selectedParent ? (
                selectedParent.name
              ) : (
                <span className="text-text-secondary">Selecione uma categoria</span>
              )}
            </button>

            {isPickerOpen && (
              <Dialog onClose={() => setIsPickerOpen(false)}>
                <h2 className="mb-4 text-lg font-semibold">Selecione a categoria</h2>
                <ul className="flex flex-col gap-1">
                  {topLevelCategories.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setParentId(c.id);
                          setIsPickerOpen(false);
                        }}
                        className="w-full cursor-pointer rounded-md px-3 py-2 text-left hover:bg-text-secondary/10"
                      >
                        {c.name}{" "}
                        <span className="text-sm text-text-secondary">
                          ({CATEGORY_KIND_LABELS[c.kind]})
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Dialog>
            )}
          </div>
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

      <div className="flex justify-center gap-2">
        <button
          type="submit"
          disabled={isPending || (isSubcategoria && !parentId)}
          className="w-fit cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90 disabled:cursor-default disabled:opacity-60"
        >
          {isPending ? "Adicionando..." : "Adicionar"}
        </button>
        <button
          type="button"
          onClick={() => setMode(isSubcategoria ? "categoria" : "subcategoria")}
          className="w-fit cursor-pointer rounded-md border border-text-secondary/30 px-4 py-2 font-medium hover:bg-text-secondary/10"
        >
          {isSubcategoria ? "Categoria" : "Subcategoria"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="w-fit cursor-pointer rounded-md border border-text-secondary/30 px-4 py-2 font-medium hover:bg-text-secondary/10"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
