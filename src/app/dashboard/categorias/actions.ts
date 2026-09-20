"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  CategoryHasChildrenError,
  CategoryNotFoundError,
  DefaultCategoryError,
  InvalidParentError,
  InvalidReassignTargetError,
  ReassignRequiredError,
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

  const parentIdRaw = formData.get("parentId");
  const parsed = CategorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    kind: formData.get("kind"),
    parentId: typeof parentIdRaw === "string" && parentIdRaw.length > 0 ? parentIdRaw : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await createCategory({ userId, ...parsed.data });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria pai não encontrada." };
    }
    if (error instanceof InvalidParentError) {
      return { error: "Não é possível criar uma subcategoria dentro de outra subcategoria." };
    }
    throw error;
  }

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

export async function deleteCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const userId = await requireUserId();
  const id = formData.get("id");
  const reassignToIdRaw = formData.get("reassignToId");
  const reassignToId =
    typeof reassignToIdRaw === "string" && reassignToIdRaw.length > 0
      ? reassignToIdRaw
      : undefined;

  if (typeof id !== "string" || id.length === 0) {
    return { error: "Categoria inválida." };
  }

  try {
    await deleteCategory({ id, userId, reassignToId });
  } catch (error) {
    if (error instanceof DefaultCategoryError) {
      return { error: "Categorias padrão não podem ser excluídas." };
    }
    if (error instanceof CategoryHasChildrenError) {
      return { error: "Remova ou mova as subcategorias antes de excluir esta categoria." };
    }
    if (error instanceof ReassignRequiredError) {
      return { error: "Escolha para qual categoria mover as transações existentes." };
    }
    if (error instanceof InvalidReassignTargetError) {
      return { error: "Escolha uma categoria de destino válida, do mesmo tipo (receita/despesa)." };
    }
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria não encontrada." };
    }
    throw error;
  }

  revalidatePath("/dashboard/categorias");
}
