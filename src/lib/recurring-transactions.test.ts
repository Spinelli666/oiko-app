import { describe, expect, it } from "vitest";
import {
  daysInMonth,
  occurrenceDateForMonth,
  occurrencesUpTo,
} from "./recurring-transactions";

describe("daysInMonth", () => {
  it("retorna 31 para janeiro", () => {
    expect(daysInMonth(2026, 0)).toBe(31);
  });

  it("retorna 28 para fevereiro em ano não bissexto", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
  });

  it("retorna 29 para fevereiro em ano bissexto", () => {
    expect(daysInMonth(2028, 1)).toBe(29);
  });

  it("retorna 30 para abril", () => {
    expect(daysInMonth(2026, 3)).toBe(30);
  });
});

describe("occurrenceDateForMonth", () => {
  it("mantém o mesmo dia do mês quando o mês de referência tem dias suficientes", () => {
    const startDate = new Date(Date.UTC(2026, 8, 15)); // 15/09
    const monthReference = new Date(Date.UTC(2026, 9, 1)); // outubro

    expect(occurrenceDateForMonth(startDate, monthReference).toISOString()).toBe(
      "2026-10-15T00:00:00.000Z"
    );
  });

  it("limita ao último dia do mês quando ele tem menos dias que o dia de início", () => {
    const startDate = new Date(Date.UTC(2026, 0, 31)); // 31/01
    const fevereiro = new Date(Date.UTC(2026, 1, 1));

    expect(occurrenceDateForMonth(startDate, fevereiro).toISOString()).toBe(
      "2026-02-28T00:00:00.000Z"
    );
  });

  it("no próprio mês de início, cai no mesmo dia informado", () => {
    const startDate = new Date(Date.UTC(2026, 8, 15));

    expect(
      occurrenceDateForMonth(startDate, startDate).toISOString()
    ).toBe("2026-09-15T00:00:00.000Z");
  });
});

describe("occurrencesUpTo", () => {
  it("gera uma ocorrência por mês, do início até o mês limite", () => {
    const startDate = new Date(Date.UTC(2026, 6, 10)); // 10/07
    const upTo = new Date(Date.UTC(2026, 8, 1)); // setembro

    expect(
      occurrencesUpTo(startDate, upTo).map((d) => d.toISOString())
    ).toEqual([
      "2026-07-10T00:00:00.000Z",
      "2026-08-10T00:00:00.000Z",
      "2026-09-10T00:00:00.000Z",
    ]);
  });

  it("retorna lista vazia quando o início é depois do mês limite", () => {
    const startDate = new Date(Date.UTC(2026, 9, 1));
    const upTo = new Date(Date.UTC(2026, 8, 1));

    expect(occurrencesUpTo(startDate, upTo)).toEqual([]);
  });

  it("gera a ocorrência do próprio mês mesmo quando o dia de início é depois do dia 1 (upTo truncado pro início do mês)", () => {
    // Regressão: startDate cai depois de upTo em termos de data "crua"
    // (10 > 1), mas os dois estão no mesmo mês — precisa gerar, não ficar vazio.
    const startDate = new Date(Date.UTC(2026, 8, 10)); // 10/09
    const upTo = new Date(Date.UTC(2026, 8, 1)); // 01/09 (início do mês atual)

    expect(
      occurrencesUpTo(startDate, upTo).map((d) => d.toISOString())
    ).toEqual(["2026-09-10T00:00:00.000Z"]);
  });

  it("ajusta cada mês da série ao seu próprio último dia quando necessário", () => {
    const startDate = new Date(Date.UTC(2026, 0, 31)); // 31/01
    const upTo = new Date(Date.UTC(2026, 3, 1)); // abril

    expect(
      occurrencesUpTo(startDate, upTo).map((d) => d.toISOString())
    ).toEqual([
      "2026-01-31T00:00:00.000Z",
      "2026-02-28T00:00:00.000Z",
      "2026-03-31T00:00:00.000Z",
      "2026-04-30T00:00:00.000Z",
    ]);
  });
});
