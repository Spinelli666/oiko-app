import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  CategoryNotFoundError,
  createCategory,
  deleteCategory,
  getCategoriesForUser,
  updateCategory,
} from "@/lib/categories";
import {
  TransactionNotFoundError,
  createTransaction,
  deleteTransaction,
  getTransactionsForUser,
  startOfCurrentMonth,
  updateTransaction,
} from "@/lib/transactions";
import {
  getBudgetsForCurrentMonth,
  removeBudget,
  setBudget,
} from "@/lib/budgets";

/** Integration tests hitting the real (local) database — this is the most
 * important suite per the project plan: a user must never be able to read,
 * edit or delete another user's data, even by guessing/reusing a valid id
 * that belongs to someone else. */

const EMAIL_A = "isolation-test-a@oiko.dev";
const EMAIL_B = "isolation-test-b@oiko.dev";

let userAId: string;
let userBId: string;

async function cleanupUsers() {
  await prisma.user.deleteMany({ where: { email: { in: [EMAIL_A, EMAIL_B] } } });
}

beforeAll(async () => {
  await cleanupUsers();
  const userA = await prisma.user.create({
    data: { name: "Isolation A", email: EMAIL_A, passwordHash: "unused" },
    select: { id: true },
  });
  const userB = await prisma.user.create({
    data: { name: "Isolation B", email: EMAIL_B, passwordHash: "unused" },
    select: { id: true },
  });
  userAId = userA.id;
  userBId = userB.id;
});

afterAll(async () => {
  await cleanupUsers();
  await prisma.$disconnect();
});

describe("isolamento entre usuários", () => {
  it("usuário B não vê categorias do usuário A na listagem", async () => {
    const categoryA = await createCategory({
      userId: userAId,
      name: "Categoria A - listagem",
      type: "ESSENCIAL",
      kind: "DESPESA",
    });

    const categoriesForB = await getCategoriesForUser(userBId);

    expect(categoriesForB.find((c) => c.id === categoryA.id)).toBeUndefined();
  });

  it("usuário B não consegue editar uma categoria do usuário A", async () => {
    const categoryA = await createCategory({
      userId: userAId,
      name: "Categoria A - editar",
      type: "ESSENCIAL",
      kind: "DESPESA",
    });

    await expect(
      updateCategory({
        id: categoryA.id,
        userId: userBId,
        name: "Sequestrada",
        type: "SUPERFLUO",
        kind: "RECEITA",
      })
    ).rejects.toBeInstanceOf(CategoryNotFoundError);

    const unchanged = await prisma.category.findUniqueOrThrow({
      where: { id: categoryA.id },
    });
    expect(unchanged.name).toBe("Categoria A - editar");
  });

  it("usuário B não consegue excluir uma categoria do usuário A", async () => {
    const categoryA = await createCategory({
      userId: userAId,
      name: "Categoria A - excluir",
      type: "ESSENCIAL",
      kind: "DESPESA",
    });

    await expect(
      deleteCategory({ id: categoryA.id, userId: userBId })
    ).rejects.toBeInstanceOf(CategoryNotFoundError);

    const stillThere = await prisma.category.findUnique({
      where: { id: categoryA.id },
    });
    expect(stillThere).not.toBeNull();
  });

  it("usuário B não vê transações do usuário A na listagem", async () => {
    const categoryA = await createCategory({
      userId: userAId,
      name: "Categoria A - transações",
      type: "ESSENCIAL",
      kind: "DESPESA",
    });
    const transactionA = await createTransaction({
      userId: userAId,
      categoryId: categoryA.id,
      description: "Gasto do usuário A",
      amount: 50,
      date: startOfCurrentMonth(),
    });

    const transactionsForB = await getTransactionsForUser(userBId);

    expect(
      transactionsForB.find((t) => t.id === transactionA.id)
    ).toBeUndefined();
  });

  it("usuário B não consegue editar nem excluir uma transação do usuário A", async () => {
    const categoryA = await createCategory({
      userId: userAId,
      name: "Categoria A - editar transação",
      type: "ESSENCIAL",
      kind: "DESPESA",
    });
    // Categoria própria do B, só pra isolar o motivo da rejeição: o teste
    // quer provar que o dono da TRANSAÇÃO é checado, não confundir com a
    // rejeição (também correta) por categoria de outro usuário.
    const categoryB = await createCategory({
      userId: userBId,
      name: "Categoria B - editar transação",
      type: "ESSENCIAL",
      kind: "DESPESA",
    });
    const transactionA = await createTransaction({
      userId: userAId,
      categoryId: categoryA.id,
      description: "Gasto original",
      amount: 20,
      date: startOfCurrentMonth(),
    });

    await expect(
      updateTransaction({
        id: transactionA.id,
        userId: userBId,
        categoryId: categoryB.id,
        description: "Sequestrada",
        amount: 999,
        date: startOfCurrentMonth(),
      })
    ).rejects.toBeInstanceOf(TransactionNotFoundError);

    await expect(
      deleteTransaction({ id: transactionA.id, userId: userBId })
    ).rejects.toBeInstanceOf(TransactionNotFoundError);

    const stillThere = await prisma.transaction.findUnique({
      where: { id: transactionA.id },
    });
    expect(stillThere).not.toBeNull();
    expect(stillThere?.description).toBe("Gasto original");
  });

  it("usuário B não consegue lançar uma transação usando uma categoria do usuário A", async () => {
    const categoryA = await createCategory({
      userId: userAId,
      name: "Categoria A - roubo de categoria",
      type: "ESSENCIAL",
      kind: "DESPESA",
    });

    await expect(
      createTransaction({
        userId: userBId,
        categoryId: categoryA.id,
        description: "Tentativa do usuário B",
        amount: 10,
        date: startOfCurrentMonth(),
      })
    ).rejects.toBeInstanceOf(CategoryNotFoundError);
  });

  it("usuário B não consegue definir orçamento numa categoria do usuário A", async () => {
    const categoryA = await createCategory({
      userId: userAId,
      name: "Categoria A - orçamento",
      type: "ESSENCIAL",
      kind: "DESPESA",
    });

    await expect(
      setBudget({ userId: userBId, categoryId: categoryA.id, limitAmount: 100 })
    ).rejects.toBeInstanceOf(CategoryNotFoundError);
  });

  it("usuário B não vê nem remove o orçamento do usuário A", async () => {
    const categoryA = await createCategory({
      userId: userAId,
      name: "Categoria A - orçamento listagem",
      type: "ESSENCIAL",
      kind: "DESPESA",
    });
    const budgetA = await setBudget({
      userId: userAId,
      categoryId: categoryA.id,
      limitAmount: 300,
    });

    const budgetsForB = await getBudgetsForCurrentMonth(userBId);
    expect(budgetsForB.find((b) => b.id === budgetA.id)).toBeUndefined();

    await removeBudget({ id: budgetA.id, userId: userBId });

    const stillThere = await prisma.budget.findUnique({
      where: { id: budgetA.id },
    });
    expect(stillThere).not.toBeNull();
  });
});
