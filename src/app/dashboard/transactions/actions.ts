"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CategoryNotFoundError } from "@/lib/categories";
import {
  RecurringTransactionNotFoundError,
  createRecurringTransaction,
  deleteRecurringTransaction,
  setRecurringTransactionActive,
  updateRecurringTransaction,
} from "@/lib/recurring-transactions";
import {
  TransactionNotFoundError,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/transactions";
import {
  RecurringTransactionSchema,
  TransactionSchema,
} from "@/lib/validation";

export type TransactionActionState = { error: string } | undefined;
export type RecurringTransactionActionState = { error: string } | undefined;

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

  revalidatePath("/dashboard/transactions");
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
      makeRecurring: formData.get("makeRecurring") === "on",
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

  revalidatePath("/dashboard/transactions");
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

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}

function parseRecurringTransactionForm(formData: FormData) {
  return RecurringTransactionSchema.safeParse({
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    startDate: formData.get("startDate"),
  });
}

export async function createRecurringTransactionAction(
  _prevState: RecurringTransactionActionState,
  formData: FormData
): Promise<RecurringTransactionActionState> {
  const userId = await requireUserId();
  const parsed = parseRecurringTransactionForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await createRecurringTransaction({
      userId,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      amount: parsed.data.amount,
      startDate: new Date(parsed.data.startDate),
    });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria inválida." };
    }
    throw error;
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}

export async function updateRecurringTransactionAction(
  _prevState: RecurringTransactionActionState,
  formData: FormData
): Promise<RecurringTransactionActionState> {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return { error: "Transação recorrente inválida." };
  }

  const parsed = parseRecurringTransactionForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await updateRecurringTransaction({
      id,
      userId,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      amount: parsed.data.amount,
      startDate: new Date(parsed.data.startDate),
    });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria inválida." };
    }
    if (error instanceof RecurringTransactionNotFoundError) {
      return { error: "Transação recorrente não encontrada." };
    }
    throw error;
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}

export async function toggleRecurringTransactionAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formData.get("id");
  const isActive = formData.get("isActive") === "true";

  if (typeof id !== "string" || id.length === 0) {
    return;
  }

  try {
    await setRecurringTransactionActive({ id, userId, isActive });
  } catch (error) {
    if (!(error instanceof RecurringTransactionNotFoundError)) {
      throw error;
    }
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}

export async function deleteRecurringTransactionAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return;
  }

  try {
    await deleteRecurringTransaction({ id, userId });
  } catch (error) {
    if (!(error instanceof RecurringTransactionNotFoundError)) {
      throw error;
    }
  }

  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard");
}
