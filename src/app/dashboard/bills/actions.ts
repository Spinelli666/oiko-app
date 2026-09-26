"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CategoryNotFoundError } from "@/lib/categories";
import {
  BillAlreadyPaidError,
  BillNotFoundError,
  createBill,
  deleteBill,
  markBillAsPaid,
  updateBill,
} from "@/lib/bills";
import { BillSchema } from "@/lib/validation";

export type BillActionState = { error: string } | undefined;

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autenticado.");
  }
  return session.user.id;
}

function parseBillForm(formData: FormData) {
  return BillSchema.safeParse({
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
  });
}

export async function createBillAction(
  _prevState: BillActionState,
  formData: FormData
): Promise<BillActionState> {
  const userId = await requireUserId();
  const parsed = parseBillForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await createBill({
      userId,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      amount: parsed.data.amount,
      dueDate: new Date(parsed.data.dueDate),
      repeatsMonthly: formData.get("repeatsMonthly") === "on",
    });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria inválida." };
    }
    throw error;
  }

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
}

export async function updateBillAction(
  _prevState: BillActionState,
  formData: FormData
): Promise<BillActionState> {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return { error: "Conta inválida." };
  }

  const parsed = parseBillForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await updateBill({
      id,
      userId,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      amount: parsed.data.amount,
      dueDate: new Date(parsed.data.dueDate),
      repeatsMonthly: formData.get("repeatsMonthly") === "on",
    });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { error: "Categoria inválida." };
    }
    if (error instanceof BillNotFoundError) {
      return { error: "Conta não encontrada." };
    }
    if (error instanceof BillAlreadyPaidError) {
      return { error: "Essa conta já foi paga." };
    }
    throw error;
  }

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
}

export async function markBillAsPaidAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return;
  }

  try {
    await markBillAsPaid({ id, userId });
  } catch (error) {
    if (!(error instanceof BillNotFoundError || error instanceof BillAlreadyPaidError)) {
      throw error;
    }
  }

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
}

export async function deleteBillAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return;
  }

  try {
    await deleteBill({ id, userId });
  } catch (error) {
    if (!(error instanceof BillNotFoundError)) {
      throw error;
    }
  }

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
}
