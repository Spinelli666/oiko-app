import { prisma } from "@/lib/prisma";
import { CategoryType, CategoryKind } from "@/generated/prisma/enums";

export class CategoryNotFoundError extends Error {}

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
