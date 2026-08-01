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

export async function createDefaultWorkspacesForUser(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  const pessoal = await tx.workspace.create({
    data: {
      name: "Pessoal",
      type: "PESSOAL",
      members: { create: { userId, role: "OWNER" } },
    },
  });

  const empresa = await tx.workspace.create({
    data: {
      name: "Empresa",
      type: "EMPRESA",
      members: { create: { userId, role: "OWNER" } },
    },
  });

  return { pessoal, empresa };
}
