import * as z from "zod";
import { CategoryType, CategoryKind } from "@/generated/prisma/enums";

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, { error: "Nome muito curto." }),
  email: z.email({ error: "E-mail inválido." }).trim(),
  password: z.string().min(8, {
    error: "A senha precisa ter pelo menos 8 caracteres.",
  }),
});

export const CategorySchema = z.object({
  name: z.string().trim().min(2, { error: "Nome muito curto." }),
  type: z.enum(CategoryType, { error: "Selecione uma classificação." }),
  kind: z.enum(CategoryKind, { error: "Selecione receita ou despesa." }),
});

export const TransactionSchema = z.object({
  categoryId: z.string().min(1, { error: "Selecione uma categoria." }),
  description: z.string().trim().min(1, { error: "Descrição obrigatória." }),
  amount: z.coerce
    .number({ error: "Informe um valor." })
    .positive({ error: "O valor precisa ser maior que zero." }),
  date: z.iso.date({ error: "Data inválida." }),
});
