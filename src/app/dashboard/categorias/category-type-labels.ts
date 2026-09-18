import { CategoryType } from "@/generated/prisma/enums";

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  ESSENCIAL: "Essencial",
  IMPORTANTE: "Importante",
  SUPERFLUO: "Supérfluo",
};

export const CATEGORY_TYPE_OPTIONS = Object.entries(CATEGORY_TYPE_LABELS) as [
  CategoryType,
  string
][];
