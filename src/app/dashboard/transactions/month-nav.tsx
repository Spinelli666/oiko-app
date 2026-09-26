const monthLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function toMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function addMonths(date: Date, delta: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1)
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function MonthNav({ monthReference }: { monthReference: Date }) {
  const previousMonth = addMonths(monthReference, -1);
  const nextMonth = addMonths(monthReference, 1);

  // Plain <a> tags on purpose: this page (/dashboard/transactions) lives inside
  // the same "/dashboard" layout as the "@modal" parallel slot, so a
  // client-side <Link> to this same route gets intercepted and reopens as a
  // modal on top of itself instead of just swapping the month. A full
  // navigation sidesteps the interceptor.
  return (
    <div className="flex items-center gap-3">
      <a
        href={`/dashboard/transactions?mes=${toMonthKey(previousMonth)}`}
        aria-label="Mês anterior"
        className="rounded-md border border-text-secondary/30 px-2 py-1 text-sm"
      >
        ←
      </a>
      <span className="text-sm font-medium">
        {capitalize(monthLabelFormatter.format(monthReference))}
      </span>
      <a
        href={`/dashboard/transactions?mes=${toMonthKey(nextMonth)}`}
        aria-label="Próximo mês"
        className="rounded-md border border-text-secondary/30 px-2 py-1 text-sm"
      >
        →
      </a>
    </div>
  );
}
