import "server-only";
import { prisma } from "@/lib/prisma";
import type { CategoryKind } from "@/generated/prisma/client";

export function listCategories(workspaceId: string) {
  return prisma.category.findMany({
    where: { workspaceId },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });
}

export function createCategory(
  workspaceId: string,
  data: { name: string; kind: CategoryKind; color: string },
) {
  return prisma.category.create({ data: { workspaceId, ...data } });
}

export async function updateCategory(
  workspaceId: string,
  categoryId: string,
  data: { name: string; kind: CategoryKind; color: string },
) {
  const result = await prisma.category.updateMany({
    where: { id: categoryId, workspaceId },
    data,
  });
  if (result.count === 0) {
    throw new Error("Categoria não encontrada");
  }
}

export async function deleteCategory(workspaceId: string, categoryId: string) {
  const inUse = await prisma.transaction.findFirst({
    where: { categoryId, workspaceId },
    select: { id: true },
  });
  if (inUse) {
    throw new Error("Não é possível excluir: existem lançamentos usando esta categoria");
  }

  const result = await prisma.category.deleteMany({
    where: { id: categoryId, workspaceId },
  });
  if (result.count === 0) {
    throw new Error("Categoria não encontrada");
  }
}
