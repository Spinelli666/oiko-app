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
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded((v) => !v)}
        transactionCount={transactionCounts.get(category.id) ?? 0}
        reassignOptions={reassignOptionsByCategory.get(category.id) ?? []}
      />

      {hasChildren && (
        <div
          className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <ul className="min-h-0">
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
        </div>
      )}
    </div>
  );
}
