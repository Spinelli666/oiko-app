"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CategoryNotFoundError } from "@/lib/categories";
import {
  TransactionNotFoundError,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/transactions";
import { TransactionSchema } from "@/lib/validation";

export type TransactionActionState = { error: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autenticado.");
  }
  return session.user.id;
}

function parseTransactionForm(formData: FormData) {
  return TransactionSchema.safeParse({
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
  });
}

export async function createTransactionAction(
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const userId = await requireUserId();
  const parsed = parseTransactionForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await createTransaction({
      userId,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
    });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria inválida." };
    }
    throw error;
  }

  revalidatePath("/dashboard/transacoes");
  revalidatePath("/dashboard");
}

export async function updateTransactionAction(
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return { error: "Transação inválida." };
  }

  const parsed = parseTransactionForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await updateTransaction({
      id,
      userId,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
    });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria inválida." };
    }
    if (error instanceof TransactionNotFoundError) {
      return { error: "Transação não encontrada." };
    }
    throw error;
  }

  revalidatePath("/dashboard/transacoes");
  revalidatePath("/dashboard");
}

export async function deleteTransactionAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return;
  }

  try {
    await deleteTransaction({ id, userId });
  } catch (error) {
    if (!(error instanceof TransactionNotFoundError)) {
      throw error;
    }
  }

  revalidatePath("/dashboard/transacoes");
  revalidatePath("/dashboard");
}
