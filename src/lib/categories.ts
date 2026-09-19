import { prisma } from "@/lib/prisma";
import { CategoryType, CategoryKind } from "@/generated/prisma/enums";
import type { CategoryModel } from "@/generated/prisma/models/Category";

export class CategoryNotFoundError extends Error {}
export class InvalidParentError extends Error {}
export class DefaultCategoryError extends Error {}
export class CategoryHasChildrenError extends Error {}
export class ReassignRequiredError extends Error {}
export class InvalidReassignTargetError extends Error {}

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
  { name: "Outras Despesas", kind: "DESPESA", type: "IMPORTANTE" },
  { name: "Salário", kind: "RECEITA", type: "IMPORTANTE" },
  { name: "Outras receitas", kind: "RECEITA", type: "IMPORTANTE" },
];

/** Creates the starter set of categories for a user, skipping any name
 * they already have (safe to call more than once for the same user).
 * These are marked `isDefault` so the user can't delete them. */
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
    data: toCreate.map((c) => ({ userId, ...c, isDefault: true })),
  });
}

export function getCategoriesForUser(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export type CategoryWithChildren = CategoryModel & {
  children: CategoryModel[];
};

/** Groups a flat category list into a two-level tree (top-level
 * categories with their subcategories), split by receita/despesa. */
export function buildCategoryTree(categories: CategoryModel[]): {
  receitas: CategoryWithChildren[];
  despesas: CategoryWithChildren[];
} {
  const childrenByParent = new Map<string, CategoryModel[]>();
  for (const category of categories) {
    if (!category.parentId) continue;
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  const topLevel = categories
    .filter((c) => !c.parentId)
    .map((c) => ({ ...c, children: childrenByParent.get(c.id) ?? [] }));

  return {
    receitas: topLevel.filter((c) => c.kind === "RECEITA"),
    despesas: topLevel.filter((c) => c.kind === "DESPESA"),
  };
}

/** Number of transactions currently posted to each category for a user. */
export async function getTransactionCountsByCategory(userId: string) {
  const groups = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId },
    _count: { _all: true },
  });
  return new Map(groups.map((g) => [g.categoryId, g._count._all]));
}

export async function createCategory({
  userId,
  name,
  type,
  kind,
  parentId,
}: {
  userId: string;
  name: string;
  type: CategoryType;
  kind: CategoryKind;
  parentId?: string;
}) {
  let resolvedKind = kind;

  if (parentId) {
    const parent = await prisma.category.findFirst({
      where: { id: parentId, userId },
    });
    if (!parent) {
      throw new CategoryNotFoundError();
    }
    if (parent.parentId) {
      throw new InvalidParentError();
    }
    // A subcategory always follows its parent's receita/despesa kind.
    resolvedKind = parent.kind;
  }

  return prisma.category.create({
    data: { userId, name, type, kind: resolvedKind, parentId: parentId ?? null },
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
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) {
    throw new CategoryNotFoundError();
  }

  // Subcategories always keep their parent's kind, regardless of what
  // the (hidden, disabled) form field sends.
  const resolvedKind = category.parentId ? category.kind : kind;

  const { count } = await prisma.category.updateMany({
    where: { id, userId },
    data: { name, type, kind: resolvedKind },
  });

  if (count === 0) {
    throw new CategoryNotFoundError();
  }
}

export async function deleteCategory({
  id,
  userId,
  reassignToId,
}: {
  id: string;
  userId: string;
  reassignToId?: string;
}) {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) {
    throw new CategoryNotFoundError();
  }

  if (category.isDefault) {
    throw new DefaultCategoryError();
  }

  const childCount = await prisma.category.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new CategoryHasChildrenError();
  }

  const transactionCount = await prisma.transaction.count({
    where: { categoryId: id },
  });

  if (transactionCount === 0) {
    await prisma.category.delete({ where: { id } });
    return;
  }

  if (!reassignToId) {
    throw new ReassignRequiredError();
  }

  const target = await prisma.category.findFirst({
    where: { id: reassignToId, userId },
  });
  if (!target || target.id === id || target.kind !== category.kind) {
    throw new InvalidReassignTargetError();
  }

  await prisma.$transaction([
    prisma.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: reassignToId },
    }),
    prisma.category.delete({ where: { id } }),
  ]);
}
