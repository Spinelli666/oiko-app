// These need to stay literal, fully-written class names (not built via
// `bg-${name}` template strings) so Tailwind's content scanner can find
// them — a dynamically concatenated class name isn't detected and its CSS
// never gets generated.
const DESPESA_COLOR_CLASSES = [
  "bg-cat-1",
  "bg-cat-2",
  "bg-cat-3",
  "bg-cat-4",
  "bg-cat-5",
  "bg-cat-6",
] as const;

// Receitas stay in shades of green, matching the --success semantic color.
const RECEITA_COLOR_CLASSES = [
  "bg-cat-green-1",
  "bg-cat-green-2",
  "bg-cat-green-3",
  "bg-cat-green-4",
  "bg-cat-green-5",
  "bg-cat-green-6",
] as const;

const DESPESA_COLOR_VARS = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
  "var(--cat-6)",
] as const;

const RECEITA_COLOR_VARS = [
  "var(--cat-green-1)",
  "var(--cat-green-2)",
  "var(--cat-green-3)",
  "var(--cat-green-4)",
  "var(--cat-green-5)",
  "var(--cat-green-6)",
] as const;

/** Picks one of the categorical palette colors by position in a list, so
 * categories shown together (e.g. sorted by amount) get distinct colors
 * as long as there are 6 or fewer of them; cycles for longer lists. */
export function categoryColorByIndex(index: number, isExpense: boolean): string {
  const classes = isExpense ? DESPESA_COLOR_CLASSES : RECEITA_COLOR_CLASSES;
  return classes[index % classes.length];
}

/** Same palette as `categoryColorByIndex`, but as a CSS `var(--...)` value
 * for contexts that need a real color (e.g. an SVG/chart `fill`) instead of
 * a Tailwind class. */
export function categoryColorVarByIndex(index: number, isExpense: boolean): string {
  const vars = isExpense ? DESPESA_COLOR_VARS : RECEITA_COLOR_VARS;
  return vars[index % vars.length];
}
