import "server-only";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { CategoryKind, Prisma, TransactionStatus } from "@/generated/prisma/client";

export type TransactionFilters = {
  month?: Date;
  status?: TransactionStatus;
  kind?: CategoryKind;
};

export function listTransactions(workspaceId: string, filters: TransactionFilters = {}) {
  const where: Prisma.TransactionWhereInput = { workspaceId };

  if (filters.month) {
    where.dueDate = { gte: startOfMonth(filters.month), lte: endOfMonth(filters.month) };
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.kind) {
    where.kind = filters.kind;
  }

  return prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { dueDate: "asc" },
  });
}

export type TransactionInput = {
  categoryId: string;
  description: string;
  amount: number;
  dueDate: Date;
  notes?: string | null;
};

async function requireCategoryInWorkspace(workspaceId: string, categoryId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, workspaceId } });
  if (!category) {
    throw new Error("Categoria inválida para este workspace");
  }
  return category;
}

export async function createTransaction(workspaceId: string, data: TransactionInput) {
  const category = await requireCategoryInWorkspace(workspaceId, data.categoryId);

  return prisma.transaction.create({
    data: {
      workspaceId,
      categoryId: category.id,
      kind: category.kind,
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate,
      notes: data.notes,
    },
  });
}

export async function updateTransaction(
  workspaceId: string,
  transactionId: string,
  data: TransactionInput,
) {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, workspaceId },
  });
  if (!existing) {
    throw new Error("Lançamento não encontrado");
  }

  const category = await requireCategoryInWorkspace(workspaceId, data.categoryId);

  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      categoryId: category.id,
      kind: category.kind,
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate,
      notes: data.notes,
    },
  });
}

export async function setTransactionStatus(
  workspaceId: string,
  transactionId: string,
  status: TransactionStatus,
) {
  const result = await prisma.transaction.updateMany({
    where: { id: transactionId, workspaceId },
    data: { status, paidAt: status === "PAGO" ? new Date() : null },
  });
  if (result.count === 0) {
    throw new Error("Lançamento não encontrado");
  }
}

export async function deleteTransaction(workspaceId: string, transactionId: string) {
  const result = await prisma.transaction.deleteMany({
    where: { id: transactionId, workspaceId },
  });
  if (result.count === 0) {
    throw new Error("Lançamento não encontrado");
  }
}

/** Status "Atrasado" é derivado (dueDate vencida + ainda pendente), não persistido. */
export function deriveDisplayStatus(transaction: { status: TransactionStatus; dueDate: Date }) {
  if (transaction.status === "PENDENTE" && transaction.dueDate < new Date()) {
    return "ATRASADO" as const;
  }
  return transaction.status;
}
