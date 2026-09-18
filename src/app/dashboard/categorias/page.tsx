import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCategoriesForUser } from "@/lib/categories";
import { AddCategoryForm } from "./add-category-form";
import { CategoryRow } from "./category-row";

export default async function CategoriasPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const categories = await getCategoriesForUser(session.user.id);

  return (
    <div className="flex flex-1 flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Categorias</h1>
          <Link href="/dashboard" className="text-sm text-primary">
            Voltar ao dashboard
          </Link>
        </div>

        <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
          <AddCategoryForm />
        </div>

        <div className="rounded-lg border border-text-secondary/20 bg-surface p-6">
          {categories.length === 0 ? (
            <p className="text-text-secondary">
              Nenhuma categoria ainda. Crie a primeira acima.
            </p>
          ) : (
            <ul>
              {categories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
