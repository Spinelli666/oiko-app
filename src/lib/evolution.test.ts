import { describe, expect, it } from "vitest";
import { computeMonthlyEvolution, lastNMonths } from "./evolution";

describe("lastNMonths", () => {
  it("retorna os últimos N meses terminando no mês de referência, do mais antigo pro mais recente", () => {
    const reference = new Date(Date.UTC(2026, 8, 15)); // 15/09/2026
    const months = lastNMonths(3, reference);

    expect(months.map((m) => m.toISOString())).toEqual([
      "2026-07-01T00:00:00.000Z",
      "2026-08-01T00:00:00.000Z",
      "2026-09-01T00:00:00.000Z",
    ]);
  });

  it("atravessa a virada de ano corretamente", () => {
    const reference = new Date(Date.UTC(2026, 1, 10)); // fevereiro/2026
    const months = lastNMonths(3, reference);

    expect(months.map((m) => m.toISOString())).toEqual([
      "2025-12-01T00:00:00.000Z",
      "2026-01-01T00:00:00.000Z",
      "2026-02-01T00:00:00.000Z",
    ]);
  });
});

describe("computeMonthlyEvolution", () => {
  it("agrupa receitas e despesas por mês e calcula o saldo", () => {
    const months = [
      new Date(Date.UTC(2026, 7, 1)),
      new Date(Date.UTC(2026, 8, 1)),
    ];
    const transactions = [
      { date: new Date(Date.UTC(2026, 7, 5)), amount: 1000 }, // receita ago
      { date: new Date(Date.UTC(2026, 7, 10)), amount: -300 }, // despesa ago
      { date: new Date(Date.UTC(2026, 8, 2)), amount: -50 }, // despesa set
    ];

    const result = computeMonthlyEvolution(transactions, months);

    expect(result).toEqual([
      { monthReference: months[0], receitas: 1000, despesas: 300, saldo: 700 },
      { monthReference: months[1], receitas: 0, despesas: 50, saldo: -50 },
    ]);
  });

  it("ignora transações fora do intervalo de meses informado", () => {
    const months = [new Date(Date.UTC(2026, 8, 1))];
    const transactions = [
      { date: new Date(Date.UTC(2026, 5, 1)), amount: 500 },
    ];

    const result = computeMonthlyEvolution(transactions, months);

    expect(result).toEqual([
      { monthReference: months[0], receitas: 0, despesas: 0, saldo: 0 },
    ]);
  });

  it("retorna zeros para um mês sem nenhuma transação", () => {
    const months = [new Date(Date.UTC(2026, 8, 1))];
    const result = computeMonthlyEvolution([], months);

    expect(result).toEqual([
      { monthReference: months[0], receitas: 0, despesas: 0, saldo: 0 },
    ]);
  });
});
