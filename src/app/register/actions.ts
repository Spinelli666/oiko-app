"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { createUser, DuplicateEmailError } from "@/lib/users";
import { RegisterSchema } from "@/lib/validation";

export type RegisterState = { error: string } | undefined;

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await createUser(parsed.data);
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return { error: error.message };
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Conta criada, mas não foi possível entrar automaticamente. Faça login.",
      };
    }
    throw error;
  }
}
