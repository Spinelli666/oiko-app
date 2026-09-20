"use client";

import { useState } from "react";
import type { CategoryWithChildren } from "@/lib/categories";
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
          className="py-1 pl-8 text-sm text-primary"
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
    </div>
  );
}
