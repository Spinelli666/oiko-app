import { describe, expect, it } from "vitest";
import { todayInAppTimezone } from "./dates";
import {
  parseMonthReference,
  sumExpensesByCategory,
  sumIncomeByCategory,
} from "./transactions";

describe("sumExpensesByCategory", () => {
  it("soma só as despesas (valores negativos), agrupadas por categoria", () => {
    const result = sumExpensesByCategory([
      { categoryId: "alimentacao", amount: -50 },
      { categoryId: "alimentacao", amount: -30 },
      { categoryId: "transporte", amount: -20 },
    ]);

    expect(result.get("alimentacao")).toBe(80);
    expect(result.get("transporte")).toBe(20);
  });

  it("ignora receitas (valores positivos)", () => {
    const result = sumExpensesByCategory([
      { categoryId: "salario", amount: 3000 },
      { categoryId: "alimentacao", amount: -50 },
    ]);

    expect(result.has("salario")).toBe(false);
    expect(result.get("alimentacao")).toBe(50);
  });

  it("ignora transações de valor zero", () => {
    const result = sumExpensesByCategory([{ categoryId: "alimentacao", amount: 0 }]);

    expect(result.has("alimentacao")).toBe(false);
  });

  it("retorna um mapa vazio quando não há transações", () => {
    const result = sumExpensesByCategory([]);
    expect(result.size).toBe(0);
  });
});

describe("sumIncomeByCategory", () => {
  it("soma só as receitas (valores positivos), agrupadas por categoria", () => {
    const result = sumIncomeByCategory([
      { categoryId: "salario", amount: 3000 },
      { categoryId: "salario", amount: 500 },
      { categoryId: "outras-receitas", amount: 100 },
    ]);

    expect(result.get("salario")).toBe(3500);
    expect(result.get("outras-receitas")).toBe(100);
  });

  it("ignora despesas (valores negativos)", () => {
    const result = sumIncomeByCategory([
      { categoryId: "alimentacao", amount: -50 },
      { categoryId: "salario", amount: 3000 },
    ]);

    expect(result.has("alimentacao")).toBe(false);
    expect(result.get("salario")).toBe(3000);
  });

  it("ignora transações de valor zero", () => {
    const result = sumIncomeByCategory([{ categoryId: "salario", amount: 0 }]);
    expect(result.has("salario")).toBe(false);
  });
});

describe("parseMonthReference", () => {
  it("interpreta uma string YYYY-MM válida como o primeiro dia daquele mês em UTC", () => {
    const result = parseMonthReference("2026-03");
    expect(result.toISOString()).toBe("2026-03-01T00:00:00.000Z");
  });

  it("cai no mês atual quando o parâmetro está ausente", () => {
    const now = todayInAppTimezone();
    const result = parseMonthReference(undefined);
    expect(result.getUTCFullYear()).toBe(now.getUTCFullYear());
    expect(result.getUTCMonth()).toBe(now.getUTCMonth());
    expect(result.getUTCDate()).toBe(1);
  });

  it("cai no mês atual quando o parâmetro está malformado", () => {
    const now = todayInAppTimezone();
    const result = parseMonthReference("mes-invalido");
    expect(result.getUTCFullYear()).toBe(now.getUTCFullYear());
    expect(result.getUTCMonth()).toBe(now.getUTCMonth());
  });

  it("cai no mês atual quando o mês está fora do intervalo 01-12", () => {
    const now = todayInAppTimezone();
    const result = parseMonthReference("2026-13");
    expect(result.getUTCFullYear()).toBe(now.getUTCFullYear());
    expect(result.getUTCMonth()).toBe(now.getUTCMonth());
  });
});
