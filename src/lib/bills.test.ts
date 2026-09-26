import { describe, expect, it } from "vitest";
import { nextMonthDueDate } from "./bills";

describe("nextMonthDueDate", () => {
  it("mantém o mesmo dia do mês, um mês depois", () => {
    const dueDate = new Date(Date.UTC(2026, 8, 15)); // 15/09

    expect(nextMonthDueDate(dueDate).toISOString()).toBe(
      "2026-10-15T00:00:00.000Z"
    );
  });

  it("limita ao último dia do próximo mês quando ele tem menos dias", () => {
    const dueDate = new Date(Date.UTC(2026, 0, 31)); // 31/01

    expect(nextMonthDueDate(dueDate).toISOString()).toBe(
      "2026-02-28T00:00:00.000Z"
    );
  });

  it("avança de dezembro pra janeiro do ano seguinte", () => {
    const dueDate = new Date(Date.UTC(2026, 11, 10)); // 10/12

    expect(nextMonthDueDate(dueDate).toISOString()).toBe(
      "2027-01-10T00:00:00.000Z"
    );
  });
});
