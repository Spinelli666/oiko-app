import { describe, expect, it } from "vitest";
import { computeBudgetAlerts, computeBudgetStatus } from "./budget-status";

describe("computeBudgetStatus", () => {
  it("sem orçamento definido, nunca está estourado e percentage é null", () => {
    expect(computeBudgetStatus(500, undefined)).toEqual({
      isOverBudget: false,
      isNearLimit: false,
      percentage: null,
    });
  });

  it("gasto abaixo do limite não está estourado", () => {
    expect(computeBudgetStatus(50, 100)).toEqual({
      isOverBudget: false,
      isNearLimit: false,
      percentage: 50,
    });
  });

  it("gasto igual ao limite não está estourado, mas conta como perto do limite, e fica em 100%", () => {
    expect(computeBudgetStatus(100, 100)).toEqual({
      isOverBudget: false,
      isNearLimit: true,
      percentage: 100,
    });
  });

  it("gasto acima do limite está estourado e o percentage é limitado a 100", () => {
    expect(computeBudgetStatus(150, 100)).toEqual({
      isOverBudget: true,
      isNearLimit: false,
      percentage: 100,
    });
  });

  it("gasto zero fica em 0%", () => {
    expect(computeBudgetStatus(0, 100)).toEqual({
      isOverBudget: false,
      isNearLimit: false,
      percentage: 0,
    });
  });

  it("arredonda a porcentagem", () => {
    expect(computeBudgetStatus(33.33, 100)).toEqual({
      isOverBudget: false,
      isNearLimit: false,
      percentage: 33,
    });
  });

  it("limite zero com gasto zero não está estourado e fica em 0%", () => {
    expect(computeBudgetStatus(0, 0)).toEqual({
      isOverBudget: false,
      isNearLimit: false,
      percentage: 0,
    });
  });

  it("limite zero com qualquer gasto está estourado e fica em 100%", () => {
    expect(computeBudgetStatus(10, 0)).toEqual({
      isOverBudget: true,
      isNearLimit: false,
      percentage: 100,
    });
  });

  it("gasto exatamente em 90% do limite já conta como perto do limite", () => {
    expect(computeBudgetStatus(90, 100)).toEqual({
      isOverBudget: false,
      isNearLimit: true,
      percentage: 90,
    });
  });

  it("gasto logo abaixo de 90% do limite não conta como perto do limite", () => {
    expect(computeBudgetStatus(89, 100)).toEqual({
      isOverBudget: false,
      isNearLimit: false,
      percentage: 89,
    });
  });

  it("gasto acima do limite não conta como 'perto do limite', e sim como estourado", () => {
    expect(computeBudgetStatus(150, 100)).toEqual({
      isOverBudget: true,
      isNearLimit: false,
      percentage: 100,
    });
  });
});

describe("computeBudgetAlerts", () => {
  it("ignora categorias sem orçamento definido", () => {
    expect(
      computeBudgetAlerts([
        { categoryId: "1", categoryName: "Lazer", spentAmount: 500 },
      ])
    ).toEqual([]);
  });

  it("ignora categorias confortavelmente abaixo do limite", () => {
    expect(
      computeBudgetAlerts([
        {
          categoryId: "1",
          categoryName: "Lazer",
          spentAmount: 50,
          limitAmount: 100,
        },
      ])
    ).toEqual([]);
  });

  it("inclui categorias perto do limite e categorias estouradas, ordenadas da maior pra menor porcentagem", () => {
    const alerts = computeBudgetAlerts([
      {
        categoryId: "near",
        categoryName: "Lazer",
        spentAmount: 90,
        limitAmount: 100,
      },
      {
        categoryId: "over",
        categoryName: "Alimentação",
        spentAmount: 150,
        limitAmount: 100,
      },
      {
        categoryId: "ok",
        categoryName: "Transporte",
        spentAmount: 10,
        limitAmount: 100,
      },
    ]);

    expect(alerts).toEqual([
      {
        categoryId: "over",
        categoryName: "Alimentação",
        spentAmount: 150,
        limitAmount: 100,
        percentage: 100,
        severity: "over",
      },
      {
        categoryId: "near",
        categoryName: "Lazer",
        spentAmount: 90,
        limitAmount: 100,
        percentage: 90,
        severity: "near",
      },
    ]);
  });
});
