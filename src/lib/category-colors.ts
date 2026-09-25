const CATEGORY_COLOR_CLASSES = [
  "bg-cat-1",
  "bg-cat-2",
  "bg-cat-3",
  "bg-cat-4",
  "bg-cat-5",
  "bg-cat-6",
] as const;

/** Picks one of the categorical palette colors by position in a list, so
 * categories shown together (e.g. sorted by amount) get distinct colors
 * as long as there are 6 or fewer of them; cycles for longer lists. */
export function categoryColorByIndex(index: number): string {
  return CATEGORY_COLOR_CLASSES[index % CATEGORY_COLOR_CLASSES.length];
}
