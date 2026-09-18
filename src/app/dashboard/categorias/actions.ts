"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  CategoryNotFoundError,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/categories";
import { CategorySchema } from "@/lib/validation";

export type CategoryActionState = { error: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autenticado.");
  }
  return session.user.id;
}

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const userId = await requireUserId();

  const parsed = CategorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    kind: formData.get("kind"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await createCategory({ userId, ...parsed.data });
  revalidatePath("/dashboard/categorias");
}

export async function updateCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return { error: "Categoria inválida." };
  }

  const parsed = CategorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    kind: formData.get("kind"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await updateCategory({ id, userId, ...parsed.data });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria não encontrada." };
    }
    throw error;
  }

  revalidatePath("/dashboard/categorias");
}

export async function deleteCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return;
  }

  try {
    await deleteCategory({ id, userId });
  } catch (error) {
    if (!(error instanceof CategoryNotFoundError)) {
      throw error;
    }
  }

  revalidatePath("/dashboard/categorias");
}
