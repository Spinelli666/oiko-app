import type { KeyboardEvent } from "react";

/** Submits the enclosing form when Enter is pressed in a single-line input.
 * Some browsers/webviews don't reliably fire native implicit form
 * submission for forms using React's `action` prop, so this covers it
 * explicitly. */
export function submitFormOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}
