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

  return (
    <div>
      <CategoryRow
        category={category}
        hasChildren={category.children.length > 0}
        transactionCount={transactionCounts.get(category.id) ?? 0}
        reassignOptions={reassignOptionsByCategory.get(category.id) ?? []}
      />
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
      <div className="border-b border-text-secondary/10 py-2 pl-8">
        {isAddingSubcategory ? (
          <AddCategoryForm
            parent={{ id: category.id, name: category.name, kind: category.kind }}
            onDone={() => setIsAddingSubcategory(false)}
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
