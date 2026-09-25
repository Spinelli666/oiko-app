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

/** Picks one of the categorical palette colors by position in a list, so
 * categories shown together (e.g. sorted by amount) get distinct colors
 * as long as there are 6 or fewer of them; cycles for longer lists. */
export function categoryColorByIndex(index: number, isExpense: boolean): string {
  const classes = isExpense ? DESPESA_COLOR_CLASSES : RECEITA_COLOR_CLASSES;
  return classes[index % classes.length];
}
