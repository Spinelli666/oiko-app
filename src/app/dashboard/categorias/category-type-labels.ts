import { CategoryType, CategoryKind } from "@/generated/prisma/enums";

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  ESSENCIAL: "Essencial",
  IMPORTANTE: "Importante",
  SUPERFLUO: "Supérfluo",
};

export const CATEGORY_TYPE_OPTIONS = Object.entries(CATEGORY_TYPE_LABELS) as [
  CategoryType,
  string
][];

export const CATEGORY_KIND_LABELS: Record<CategoryKind, string> = {
  DESPESA: "Despesa",
  RECEITA: "Receita",
};

export const CATEGORY_KIND_OPTIONS = Object.entries(CATEGORY_KIND_LABELS) as [
  CategoryKind,
  string
][];
