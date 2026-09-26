"use client";

import { useEffect, useId, useRef, useState } from "react";

type CurrencyState = {
  integerDigits: string;
  fractionDigits: string;
  isEmpty: boolean;
};

function stateFromValue(value: number | undefined): CurrencyState {
  if (value === undefined || value === 0) {
    return { integerDigits: "", fractionDigits: "", isEmpty: true };
  }
  const [integer, fraction] = value.toFixed(2).split(".");
  return {
    integerDigits: integer.replace(/^0+(?=\d)/, ""),
    fractionDigits: fraction,
    isEmpty: false,
  };
}

/** Parses whatever the field currently displays (digits, dots and one comma,
 * in any order/position) back into integer and fraction digit strings. This
 * is cursor-position-agnostic: it just reads meaning out of the resulting
 * text after each keystroke, regardless of where the caret was. */
function stateFromDisplay(raw: string): CurrencyState {
  let hasSeparator = false;
  let integerDigits = "";
  let fractionDigits = "";
  for (const char of raw) {
    if (char === "," || char === ".") {
      hasSeparator = true;
      continue;
    }
    if (char < "0" || char > "9") continue;
    if (!hasSeparator) {
      integerDigits += char;
    } else if (fractionDigits.length < 2) {
      fractionDigits += char;
    }
  }
  integerDigits = integerDigits.replace(/^0+(?=\d)/, "");
  return {
    integerDigits,
    fractionDigits,
    isEmpty: integerDigits === "" && fractionDigits === "" && !hasSeparator,
  };
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function toDisplay(state: CurrencyState): string {
  if (state.isEmpty) return "";
  const integer = groupThousands(state.integerDigits || "0");
  const fraction = state.fractionDigits.padEnd(2, "0");
  return `${integer},${fraction}`;
}

function toNumericString(state: CurrencyState): string {
  if (state.isEmpty) return "";
  const integer = state.integerDigits || "0";
  const fraction = state.fractionDigits.padEnd(2, "0");
  return `${integer}.${fraction}`;
}

/** A text input that formats a currency value as the user types (thousands
 * separators, comma decimals — e.g. typing "50" shows "50,00"), while
 * submitting the plain numeric value through a hidden field under `name`. */
export function CurrencyInput({
  id,
  name,
  defaultValue,
  required,
  placeholder = "0,00",
  className,
}: {
  id?: string;
  name: string;
  defaultValue?: number;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [state, setState] = useState(() => stateFromValue(defaultValue));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const formEl = inputRef.current?.form;
    if (!formEl) return;
    function handleReset() {
      setState(stateFromValue(defaultValue));
    }
    formEl.addEventListener("reset", handleReset);
    return () => formEl.removeEventListener("reset", handleReset);
  }, [defaultValue]);

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        inputMode="decimal"
        required={required}
        value={toDisplay(state)}
        onChange={(event) => setState(stateFromDisplay(event.target.value))}
        placeholder={placeholder}
        className={className}
      />
      <input type="hidden" name={name} value={toNumericString(state)} />
    </>
  );
}
