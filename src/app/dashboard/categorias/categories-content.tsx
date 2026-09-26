import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getCategoriesForUser,
  getTransactionCountsByCategory,
  splitCategoriesByKind,
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

  const { receitas, despesas } = splitCategoriesByKind(categories);

  const reassignOptionsByCategory = new Map(
    categories.map((category) => [
      category.id,
      categories
        .filter((c) => c.id !== category.id && c.kind === category.kind)
        .map((c) => ({ id: c.id, name: c.name })),
    ])
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Categorias</h1>

      <CategoriesList
        receitas={receitas}
        despesas={despesas}
        transactionCounts={transactionCounts}
        reassignOptionsByCategory={reassignOptionsByCategory}
      >
        <AddCategorySection />
      </CategoriesList>
    </div>
  );
}
