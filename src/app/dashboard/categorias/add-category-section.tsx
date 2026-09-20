"use client";

import { useState } from "react";
import type { CategoryKind } from "@/generated/prisma/enums";
import { AddCategoryForm } from "./add-category-form";

export function AddCategorySection({
  topLevelCategories,
}: {
  topLevelCategories: Array<{ id: string; name: string; kind: CategoryKind }>;
}) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
      {isAdding ? (
        <AddCategoryForm
          topLevelCategories={topLevelCategories}
          onDone={() => setIsAdding(false)}
        />
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-fit rounded-md bg-primary px-4 py-2 font-medium text-white"
          >
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}
