import { describe, expect, it } from "vitest";
import {
  bucketStart,
  bucketsInRange,
  computeEvolution,
  defaultRangeFor,
} from "./evolution";

describe("bucketStart", () => {
  it("diario: volta pra meia-noite (UTC) daquele dia", () => {
    const date = new Date(Date.UTC(2026, 8, 16, 14, 30));
    expect(bucketStart(date, "diario").toISOString()).toBe(
      "2026-09-16T00:00:00.000Z"
    );
  });

  it("semanal: volta pra segunda-feira daquela semana", () => {
    const wednesday = new Date(Date.UTC(2026, 8, 16)); // quarta, 16/09/2026
    expect(bucketStart(wednesday, "semanal").toISOString()).toBe(
      "2026-09-14T00:00:00.000Z" // segunda anterior
    );
  });

  it("semanal: domingo pertence à semana que começou na segunda anterior", () => {
    const sunday = new Date(Date.UTC(2026, 8, 20)); // domingo, 20/09/2026
    expect(bucketStart(sunday, "semanal").toISOString()).toBe(
      "2026-09-14T00:00:00.000Z"
    );
  });

  it("mensal: volta pro primeiro dia do mês", () => {
    const date = new Date(Date.UTC(2026, 8, 16));
    expect(bucketStart(date, "mensal").toISOString()).toBe(
      "2026-09-01T00:00:00.000Z"
    );
  });

  it("anual: volta pro primeiro dia do ano", () => {
    const date = new Date(Date.UTC(2026, 8, 16));
    expect(bucketStart(date, "anual").toISOString()).toBe(
      "2026-01-01T00:00:00.000Z"
    );
  });
});

describe("bucketsInRange", () => {
  it("gera os buckets diários entre duas datas", () => {
    const from = new Date(Date.UTC(2026, 8, 16));
    const to = new Date(Date.UTC(2026, 8, 19));
    const buckets = bucketsInRange(from, to, "diario");

    expect(buckets.map((b) => b.toISOString())).toEqual([
      "2026-09-16T00:00:00.000Z",
      "2026-09-17T00:00:00.000Z",
      "2026-09-18T00:00:00.000Z",
      "2026-09-19T00:00:00.000Z",
    ]);
  });

  it("gera os buckets semanais entre duas datas, do mais antigo pro mais recente", () => {
    const from = new Date(Date.UTC(2026, 8, 1));
    const to = new Date(Date.UTC(2026, 8, 20));
    const buckets = bucketsInRange(from, to, "semanal");

    expect(buckets.map((b) => b.toISOString())).toEqual([
      "2026-08-31T00:00:00.000Z",
      "2026-09-07T00:00:00.000Z",
      "2026-09-14T00:00:00.000Z",
    ]);
  });

  it("gera os buckets mensais entre duas datas, atravessando o ano", () => {
    const from = new Date(Date.UTC(2025, 11, 15));
    const to = new Date(Date.UTC(2026, 1, 10));
    const buckets = bucketsInRange(from, to, "mensal");

    expect(buckets.map((b) => b.toISOString())).toEqual([
      "2025-12-01T00:00:00.000Z",
      "2026-01-01T00:00:00.000Z",
      "2026-02-01T00:00:00.000Z",
    ]);
  });

  it("gera os buckets anuais entre duas datas", () => {
    const from = new Date(Date.UTC(2023, 5, 1));
    const to = new Date(Date.UTC(2026, 2, 1));
    const buckets = bucketsInRange(from, to, "anual");

    expect(buckets.map((b) => b.toISOString())).toEqual([
      "2023-01-01T00:00:00.000Z",
      "2024-01-01T00:00:00.000Z",
      "2025-01-01T00:00:00.000Z",
      "2026-01-01T00:00:00.000Z",
    ]);
  });

  it("retorna uma lista vazia quando a data inicial é depois da final", () => {
    const from = new Date(Date.UTC(2026, 8, 20));
    const to = new Date(Date.UTC(2026, 8, 1));
    expect(bucketsInRange(from, to, "mensal")).toEqual([]);
  });
});

describe("computeEvolution", () => {
  it("agrupa receitas e despesas por bucket e calcula o saldo", () => {
    const buckets = [
      new Date(Date.UTC(2026, 7, 1)),
      new Date(Date.UTC(2026, 8, 1)),
    ];
    const transactions = [
      { date: new Date(Date.UTC(2026, 7, 5)), amount: 1000 },
      { date: new Date(Date.UTC(2026, 7, 10)), amount: -300 },
      { date: new Date(Date.UTC(2026, 8, 2)), amount: -50 },
    ];

    const result = computeEvolution(transactions, buckets, "mensal");

    expect(result).toEqual([
      { bucketStart: buckets[0], receitas: 1000, despesas: 300, saldo: 700 },
      { bucketStart: buckets[1], receitas: 0, despesas: 50, saldo: -50 },
    ]);
  });

  it("ignora transações fora dos buckets informados", () => {
    const buckets = [new Date(Date.UTC(2026, 8, 1))];
    const transactions = [{ date: new Date(Date.UTC(2026, 5, 1)), amount: 500 }];

    const result = computeEvolution(transactions, buckets, "mensal");

    expect(result).toEqual([
      { bucketStart: buckets[0], receitas: 0, despesas: 0, saldo: 0 },
    ]);
  });

  it("agrega corretamente no modo diário", () => {
    const buckets = [new Date(Date.UTC(2026, 8, 16))];
    const transactions = [
      { date: new Date(Date.UTC(2026, 8, 16, 9)), amount: -30 },
      { date: new Date(Date.UTC(2026, 8, 16, 20)), amount: 100 },
      { date: new Date(Date.UTC(2026, 8, 17)), amount: -50 }, // dia seguinte, fora
    ];

    const result = computeEvolution(transactions, buckets, "diario");

    expect(result).toEqual([
      { bucketStart: buckets[0], receitas: 100, despesas: 30, saldo: 70 },
    ]);
  });

  it("agrega corretamente no modo semanal", () => {
    const buckets = [new Date(Date.UTC(2026, 8, 14))]; // segunda 14/09
    const transactions = [
      { date: new Date(Date.UTC(2026, 8, 16)), amount: -100 }, // quarta, mesma semana
      { date: new Date(Date.UTC(2026, 8, 21)), amount: -50 }, // segunda seguinte, fora
    ];

    const result = computeEvolution(transactions, buckets, "semanal");

    expect(result).toEqual([
      { bucketStart: buckets[0], receitas: 0, despesas: 100, saldo: -100 },
    ]);
  });
});

describe("defaultRangeFor", () => {
  it("diario: últimos 14 dias terminando hoje", () => {
    const reference = new Date(Date.UTC(2026, 8, 19));
    const { from, to } = defaultRangeFor("diario", reference);

    expect(from.toISOString()).toBe("2026-09-06T00:00:00.000Z");
    expect(to).toBe(reference);
  });

  it("mensal: últimos 6 meses terminando hoje", () => {
    const reference = new Date(Date.UTC(2026, 8, 19));
    const { from, to } = defaultRangeFor("mensal", reference);

    expect(from.toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(to).toBe(reference);
  });

  it("anual: últimos 5 anos terminando hoje", () => {
    const reference = new Date(Date.UTC(2026, 8, 19));
    const { from } = defaultRangeFor("anual", reference);

    expect(from.toISOString()).toBe("2022-01-01T00:00:00.000Z");
  });

  it("semanal: últimas 8 semanas terminando hoje", () => {
    const reference = new Date(Date.UTC(2026, 8, 19)); // sábado
    const { from } = defaultRangeFor("semanal", reference);

    // segunda da semana de referência é 14/09; 7 semanas antes = 27/07
    expect(from.toISOString()).toBe("2026-07-27T00:00:00.000Z");
  });
});
