import * as z from "zod";
import { CategoryType } from "@/generated/prisma/enums";

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
});
