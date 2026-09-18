import { prisma } from "@/lib/prisma";
import { CategoryType } from "@/generated/prisma/enums";

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
}: {
  userId: string;
  name: string;
  type: CategoryType;
}) {
  return prisma.category.create({
    data: { userId, name, type },
  });
}

export async function updateCategory({
  id,
  userId,
  name,
  type,
}: {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
}) {
  const { count } = await prisma.category.updateMany({
    where: { id, userId },
    data: { name, type },
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
