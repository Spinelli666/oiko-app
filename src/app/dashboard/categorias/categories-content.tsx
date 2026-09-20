import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  buildCategoryTree,
  getCategoriesForUser,
  getTransactionCountsByCategory,
} from "@/lib/categories";
import { AddCategorySection } from "./add-category-section";
import { CategoriesList } from "./categories-list";

export async function CategoriesContent() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [categories, transactionCounts] = await Promise.all([
    getCategoriesForUser(session.user.id),
    getTransactionCountsByCategory(session.user.id),
  ]);

  const { receitas, despesas } = buildCategoryTree(categories);

  const topLevelCategories = categories
    .filter((c) => !c.parentId)
    .map((c) => ({ id: c.id, name: c.name, kind: c.kind }));

  const reassignOptionsByCategory = new Map(
    categories.map((category) => [
      category.id,
      categories
        .filter((c) => c.id !== category.id && c.kind === category.kind)
        .map((c) => ({
          id: c.id,
          name: c.parentId
            ? `${categories.find((p) => p.id === c.parentId)?.name ?? ""} > ${c.name}`
            : c.name,
        })),
    ])
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Categorias</h1>

      <CategoriesList
        receitas={receitas}
        despesas={despesas}
        transactionCounts={transactionCounts}
        reassignOptionsByCategory={reassignOptionsByCategory}
      >
        <AddCategorySection topLevelCategories={topLevelCategories} />
      </CategoriesList>
    </div>
  );
}
