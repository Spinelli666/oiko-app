const APP_TIMEZONE = "America/Sao_Paulo";

/** "Today" as a UTC-midnight Date matching the app's timezone (Brazil),
 * regardless of the server's or browser's own local timezone. Deriving
 * "today" from `new Date()`'s UTC (or local) getters is wrong here: near
 * the end of the day in Brazil (UTC-3), the UTC calendar date has already
 * rolled over to tomorrow, so anything computed that way — month
 * boundaries, chart ranges, default form dates — shows the wrong day for
 * the last few hours of every Brazilian day. */
export function todayInAppTimezone(reference = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(reference);

  const year = Number(parts.find((p) => p.type === "year")!.value);
  const month = Number(parts.find((p) => p.type === "month")!.value);
  const day = Number(parts.find((p) => p.type === "day")!.value);

  return new Date(Date.UTC(year, month - 1, day));
}
