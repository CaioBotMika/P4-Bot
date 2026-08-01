import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { getActiveWorkspaceIdCookie } from "./context";

const WORKSPACE_TYPE_ORDER: Record<string, number> = { PESSOAL: 0, EMPRESA: 1 };

export async function listMembershipsForUser(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
  });

  return memberships.sort(
    (a, b) => WORKSPACE_TYPE_ORDER[a.workspace.type] - WORKSPACE_TYPE_ORDER[b.workspace.type],
  );
}

/** Workspace ativo do usuário: usa o cookie se válido, senão cai no primeiro (Pessoal por padrão). */
export async function getActiveWorkspace(userId: string) {
  const memberships = await listMembershipsForUser(userId);
  if (memberships.length === 0) return null;

  const activeId = await getActiveWorkspaceIdCookie();
  const active = memberships.find((m) => m.workspaceId === activeId);
  return (active ?? memberships[0]).workspace;
}

/** Barreira de segurança: garante que o usuário é membro do workspace antes de qualquer leitura/escrita. */
export async function requireWorkspaceAccess(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    include: { workspace: true },
  });

  if (!membership) {
    throw new Error("Acesso negado a este workspace");
  }

  return membership;
}

/**
 * O sistema é único: existe exatamente um workspace Pessoal e um Empresa,
 * compartilhados por todos os usuários (gestão em conjunto, não por usuário).
 * `type` é @unique no schema, então isso funciona como um "get or create".
 */
async function ensureSharedWorkspace(
  tx: Prisma.TransactionClient,
  type: "PESSOAL" | "EMPRESA",
  name: string,
) {
  const existing = await tx.workspace.findUnique({ where: { type } });
  if (existing) return existing;

  try {
    return await tx.workspace.create({ data: { name, type } });
  } catch {
    // Corrida rara: outro signup criou o workspace entre o findUnique e o create.
    const created = await tx.workspace.findUnique({ where: { type } });
    if (created) return created;
    throw new Error(`Não foi possível garantir o workspace ${type}`);
  }
}

/** Garante os dois workspaces compartilhados e adiciona o usuário como membro de ambos. */
export async function joinSharedWorkspaces(tx: Prisma.TransactionClient, userId: string) {
  const pessoal = await ensureSharedWorkspace(tx, "PESSOAL", "Pessoal");
  const empresa = await ensureSharedWorkspace(tx, "EMPRESA", "Empresa");

  await tx.workspaceMember.createMany({
    data: [
      { userId, workspaceId: pessoal.id, role: "OWNER" },
      { userId, workspaceId: empresa.id, role: "OWNER" },
    ],
    skipDuplicates: true,
  });

  return { pessoal, empresa };
}
