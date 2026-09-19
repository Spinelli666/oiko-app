import { describe, expect, it } from "vitest";
import { computeBudgetStatus } from "./budget-status";

describe("computeBudgetStatus", () => {
  it("sem orçamento definido, nunca está estourado e percentage é null", () => {
    expect(computeBudgetStatus(500, undefined)).toEqual({
      isOverBudget: false,
      percentage: null,
    });
  });

  it("gasto abaixo do limite não está estourado", () => {
    expect(computeBudgetStatus(50, 100)).toEqual({
      isOverBudget: false,
      percentage: 50,
    });
  });

  it("gasto igual ao limite não está estourado e fica em 100%", () => {
    expect(computeBudgetStatus(100, 100)).toEqual({
      isOverBudget: false,
      percentage: 100,
    });
  });

  it("gasto acima do limite está estourado e o percentage é limitado a 100", () => {
    expect(computeBudgetStatus(150, 100)).toEqual({
      isOverBudget: true,
      percentage: 100,
    });
  });

  it("gasto zero fica em 0%", () => {
    expect(computeBudgetStatus(0, 100)).toEqual({
      isOverBudget: false,
      percentage: 0,
    });
  });

  it("arredonda a porcentagem", () => {
    expect(computeBudgetStatus(33.33, 100)).toEqual({
      isOverBudget: false,
      percentage: 33,
    });
  });

  it("limite zero com gasto zero não está estourado e fica em 0%", () => {
    expect(computeBudgetStatus(0, 0)).toEqual({
      isOverBudget: false,
      percentage: 0,
    });
  });

  it("limite zero com qualquer gasto está estourado e fica em 100%", () => {
    expect(computeBudgetStatus(10, 0)).toEqual({
      isOverBudget: true,
      percentage: 100,
    });
  });
});
