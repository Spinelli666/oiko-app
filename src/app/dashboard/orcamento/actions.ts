"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CategoryNotFoundError } from "@/lib/categories";
import { CategoryNotDespesaError, removeBudget, setBudget } from "@/lib/budgets";
import { BudgetSchema } from "@/lib/validation";

export type BudgetActionState = { error: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autenticado.");
  }
  return session.user.id;
}

export async function setBudgetAction(
  _prevState: BudgetActionState,
  formData: FormData
): Promise<BudgetActionState> {
  const userId = await requireUserId();

  const parsed = BudgetSchema.safeParse({
    categoryId: formData.get("categoryId"),
    limitAmount: formData.get("limitAmount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await setBudget({ userId, ...parsed.data });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria inválida." };
    }
    if (error instanceof CategoryNotDespesaError) {
      return { error: "Orçamento só se aplica a categorias de despesa." };
    }
    throw error;
  }

  revalidatePath("/dashboard/orcamento");
  revalidatePath("/dashboard");
}

export async function removeBudgetAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return;
  }

  await removeBudget({ id, userId });

  revalidatePath("/dashboard/orcamento");
  revalidatePath("/dashboard");
}
