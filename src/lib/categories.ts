import { prisma } from "@/lib/prisma";
import { CategoryType, CategoryKind } from "@/generated/prisma/enums";

export class CategoryNotFoundError extends Error {}

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  kind: CategoryKind;
  type: CategoryType;
}> = [
  { name: "Moradia", kind: "DESPESA", type: "ESSENCIAL" },
  { name: "Alimentação", kind: "DESPESA", type: "ESSENCIAL" },
  { name: "Transporte", kind: "DESPESA", type: "ESSENCIAL" },
  { name: "Saúde", kind: "DESPESA", type: "ESSENCIAL" },
  { name: "Educação", kind: "DESPESA", type: "IMPORTANTE" },
  { name: "Assinaturas", kind: "DESPESA", type: "IMPORTANTE" },
  { name: "Lazer", kind: "DESPESA", type: "SUPERFLUO" },
  { name: "Compras", kind: "DESPESA", type: "SUPERFLUO" },
  { name: "Salário", kind: "RECEITA", type: "IMPORTANTE" },
  { name: "Outras receitas", kind: "RECEITA", type: "IMPORTANTE" },
];

/** Creates the starter set of categories for a user, skipping any name
 * they already have (safe to call more than once for the same user). */
export async function seedDefaultCategories(userId: string) {
  const existing = await prisma.category.findMany({
    where: { userId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name));

  const toCreate = DEFAULT_CATEGORIES.filter(
    (c) => !existingNames.has(c.name)
  );
  if (toCreate.length === 0) {
    return;
  }

  await prisma.category.createMany({
    data: toCreate.map((c) => ({ userId, ...c })),
  });
}

export function getCategoriesForUser(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export function createCategory({
  userId,
  name,
  type,
  kind,
}: {
  userId: string;
  name: string;
  type: CategoryType;
  kind: CategoryKind;
}) {
  return prisma.category.create({
    data: { userId, name, type, kind },
  });
}

export async function updateCategory({
  id,
  userId,
  name,
  type,
  kind,
}: {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  kind: CategoryKind;
}) {
  const { count } = await prisma.category.updateMany({
    where: { id, userId },
    data: { name, type, kind },
  });

  if (count === 0) {
    throw new CategoryNotFoundError();
  }
}

export async function deleteCategory({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const { count } = await prisma.category.deleteMany({
    where: { id, userId },
  });

  if (count === 0) {
    throw new CategoryNotFoundError();
  }
}
