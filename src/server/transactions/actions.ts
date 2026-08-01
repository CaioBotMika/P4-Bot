"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireActiveWorkspace } from "@/server/workspaces/guards";
import * as transactionsService from "./service";

export type TransactionActionState = { error?: string } | undefined;

const transactionSchema = z.object({
  categoryId: z.string().trim().min(1, "Selecione uma categoria"),
  description: z.string().trim().min(1, "Informe uma descrição").max(120, "Descrição muito longa"),
  amount: z.coerce.number({ error: "Informe um valor" }).positive("O valor deve ser maior que zero"),
  dueDate: z.string().trim().min(1, "Informe a data de vencimento"),
  notes: z.string().trim().max(500).optional(),
});

function parseDueDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export async function createTransactionAction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const { workspace } = await requireActiveWorkspace();

  const parsed = transactionSchema.safeParse({
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await transactionsService.createTransaction(workspace.id, {
      ...parsed.data,
      dueDate: parseDueDate(parsed.data.dueDate),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao criar lançamento" };
  }

  revalidatePath("/transacoes");
  revalidatePath("/");
}

export async function updateTransactionAction(
  _prevState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const { workspace } = await requireActiveWorkspace();
  const id = String(formData.get("id") ?? "");

  const parsed = transactionSchema.safeParse({
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes") || undefined,
  });

  if (!id || !parsed.success) {
    return { error: parsed.success ? "Lançamento inválido" : parsed.error.issues[0]?.message };
  }

  try {
    await transactionsService.updateTransaction(workspace.id, id, {
      ...parsed.data,
      dueDate: parseDueDate(parsed.data.dueDate),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao atualizar lançamento" };
  }

  revalidatePath("/transacoes");
  revalidatePath("/");
}

export async function markTransactionPaidAction(formData: FormData) {
  const { workspace } = await requireActiveWorkspace();
  const id = String(formData.get("id") ?? "");

  await transactionsService.setTransactionStatus(workspace.id, id, "PAGO");
  revalidatePath("/transacoes");
  revalidatePath("/");
}

export async function markTransactionPendingAction(formData: FormData) {
  const { workspace } = await requireActiveWorkspace();
  const id = String(formData.get("id") ?? "");

  await transactionsService.setTransactionStatus(workspace.id, id, "PENDENTE");
  revalidatePath("/transacoes");
  revalidatePath("/");
}

export async function deleteTransactionAction(formData: FormData) {
  const { workspace } = await requireActiveWorkspace();
  const id = String(formData.get("id") ?? "");

  await transactionsService.deleteTransaction(workspace.id, id);
  revalidatePath("/transacoes");
  revalidatePath("/");
}
