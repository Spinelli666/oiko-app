"use client";

import { useState } from "react";
import type { CategoryKind } from "@/generated/prisma/enums";
import { AddCategoryForm } from "./add-category-form";

export function AddCategorySection() {
  const [kind, setKind] = useState<CategoryKind | null>(null);

  return (
    <div className="rounded-lg border border-text-secondary/20 bg-surface p-4">
      {kind ? (
        <AddCategoryForm key={kind} kind={kind} onDone={() => setKind(null)} />
      ) : (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setKind("RECEITA")}
            className="w-fit cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 active:scale-95"
          >
            Receitas
          </button>
          <button
            type="button"
            onClick={() => setKind("DESPESA")}
            className="w-fit cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary/90 active:scale-95"
          >
            Despesas
          </button>
        </div>
      )}
    </div>
  );
}
