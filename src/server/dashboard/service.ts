import "server-only";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function getMonthSummary(workspaceId: string, referenceDate: Date) {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  const [receitasPagas, despesasPagas, receitasPendentes, despesasPendentes] = await Promise.all([
    prisma.transaction.aggregate({
      where: { workspaceId, kind: "RECEITA", status: "PAGO", dueDate: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { workspaceId, kind: "DESPESA", status: "PAGO", dueDate: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { workspaceId, kind: "RECEITA", status: "PENDENTE", dueDate: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { workspaceId, kind: "DESPESA", status: "PENDENTE", dueDate: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
  ]);

  const receitas = toNumber(receitasPagas._sum.amount);
  const despesas = toNumber(despesasPagas._sum.amount);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
    receitasPendentes: toNumber(receitasPendentes._sum.amount),
    despesasPendentes: toNumber(despesasPendentes._sum.amount),
  };
}

export async function getExpensesByCategory(workspaceId: string, referenceDate: Date) {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { workspaceId, kind: "DESPESA", dueDate: { gte: monthStart, lte: monthEnd } },
    _sum: { amount: true },
  });

  if (grouped.length === 0) return [];

  const categories = await prisma.category.findMany({
    where: { id: { in: grouped.map((g) => g.categoryId) } },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return grouped
    .map((g) => {
      const category = categoryMap.get(g.categoryId);
      return {
        categoryId: g.categoryId,
        name: category?.name ?? "Sem categoria",
        color: category?.color ?? "#a1a1aa",
        total: toNumber(g._sum.amount),
      };
    })
    .sort((a, b) => b.total - a.total);
}

export async function getMonthlySeries(workspaceId: string, referenceDate: Date, months = 6) {
  const series = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const month = subMonths(referenceDate, i);
    const summary = await getMonthSummary(workspaceId, month);
    series.push({
      label: format(month, "MMM/yy", { locale: ptBR }),
      receitas: summary.receitas,
      despesas: summary.despesas,
    });
  }

  return series;
}
