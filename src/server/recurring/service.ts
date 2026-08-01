import "server-only";
import { setDate, lastDayOfMonth, startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { CategoryKind } from "@/generated/prisma/client";

export function listRecurringRules(workspaceId: string) {
  return prisma.recurringRule.findMany({
    where: { workspaceId },
    include: { category: true },
    orderBy: [{ active: "desc" }, { dayOfMonth: "asc" }],
  });
}

export type RecurringRuleInput = {
  categoryId: string;
  description: string;
  amount: number;
  dayOfMonth: number;
  startDate: Date;
  endDate?: Date | null;
};

async function requireCategoryInWorkspace(workspaceId: string, categoryId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, workspaceId } });
  if (!category) {
    throw new Error("Categoria inválida para este workspace");
  }
  return category;
}

export async function createRecurringRule(workspaceId: string, data: RecurringRuleInput) {
  const category = await requireCategoryInWorkspace(workspaceId, data.categoryId);

  return prisma.recurringRule.create({
    data: {
      workspaceId,
      categoryId: category.id,
      kind: category.kind as CategoryKind,
      description: data.description,
      amount: data.amount,
      dayOfMonth: data.dayOfMonth,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
    },
  });
}

export async function setRecurringRuleActive(workspaceId: string, ruleId: string, active: boolean) {
  const result = await prisma.recurringRule.updateMany({
    where: { id: ruleId, workspaceId },
    data: { active },
  });
  if (result.count === 0) {
    throw new Error("Regra não encontrada");
  }
}

export async function deleteRecurringRule(workspaceId: string, ruleId: string) {
  const result = await prisma.recurringRule.deleteMany({
    where: { id: ruleId, workspaceId },
  });
  if (result.count === 0) {
    throw new Error("Regra não encontrada");
  }
}

/**
 * Gera os lançamentos do mês de referência para as regras ativas que ainda não
 * têm um lançamento gerado nesse mês. Idempotente: pode ser chamada a cada
 * carregamento das páginas de transações/dashboard sem duplicar dados.
 */
export async function generatePendingForMonth(workspaceId: string, referenceDate: Date = new Date()) {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  const rules = await prisma.recurringRule.findMany({
    where: {
      workspaceId,
      active: true,
      startDate: { lte: monthEnd },
      OR: [{ endDate: null }, { endDate: { gte: monthStart } }],
    },
  });

  let created = 0;

  for (const rule of rules) {
    const alreadyGenerated = await prisma.transaction.findFirst({
      where: { recurringRuleId: rule.id, dueDate: { gte: monthStart, lte: monthEnd } },
      select: { id: true },
    });
    if (alreadyGenerated) continue;

    const lastDay = lastDayOfMonth(referenceDate).getDate();
    const day = Math.min(rule.dayOfMonth, lastDay);
    const dueDate = setDate(monthStart, day);

    await prisma.transaction.create({
      data: {
        workspaceId,
        categoryId: rule.categoryId,
        kind: rule.kind,
        description: rule.description,
        amount: rule.amount,
        dueDate,
        recurringRuleId: rule.id,
      },
    });
    created += 1;
  }

  return created;
}
