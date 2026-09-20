"use client";

import { useState } from "react";
import type { CategoryWithChildren } from "@/lib/categories";
import { AddCategoryForm } from "./add-category-form";
import { CategoryRow } from "./category-row";

export function CategoryGroup({
  category,
  transactionCounts,
  reassignOptionsByCategory,
}: {
  category: CategoryWithChildren;
  transactionCounts: Map<string, number>;
  reassignOptionsByCategory: Map<string, Array<{ id: string; name: string }>>;
}) {
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children.length > 0;

  return (
    <div>
      <CategoryRow
        category={category}
        hasChildren={hasChildren}
        transactionCount={transactionCounts.get(category.id) ?? 0}
        reassignOptions={reassignOptionsByCategory.get(category.id) ?? []}
      />

      {hasChildren && (
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="py-1 pl-8 text-sm text-text-secondary"
        >
          {isExpanded ? "▾ Ocultar" : "▸ Mostrar"} {category.children.length}{" "}
          {category.children.length === 1 ? "subcategoria" : "subcategorias"}
        </button>
      )}

      {isExpanded && (
        <ul>
          {category.children.map((child) => (
            <CategoryRow
              key={child.id}
              category={child}
              isSubcategory
              transactionCount={transactionCounts.get(child.id) ?? 0}
              reassignOptions={reassignOptionsByCategory.get(child.id) ?? []}
            />
          ))}
        </ul>
      )}

      <div className="border-b border-text-secondary/10 py-2 pl-8">
        {isAddingSubcategory ? (
          <AddCategoryForm
            parent={{ id: category.id, name: category.name, kind: category.kind }}
            onDone={() => {
              setIsAddingSubcategory(false);
              setIsExpanded(true);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingSubcategory(true)}
            className="text-sm text-primary"
          >
            + Subcategoria
          </button>
        )}
      </div>
    </div>
  );
}
