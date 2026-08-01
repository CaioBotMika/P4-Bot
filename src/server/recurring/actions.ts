"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireActiveWorkspace } from "@/server/workspaces/guards";
import * as recurringService from "./service";

export type RecurringActionState = { error?: string } | undefined;

const ruleSchema = z.object({
  categoryId: z.string().trim().min(1, "Selecione uma categoria"),
  description: z.string().trim().min(1, "Informe uma descrição").max(120),
  amount: z.coerce.number({ error: "Informe um valor" }).positive("O valor deve ser maior que zero"),
  dayOfMonth: z.coerce.number().int().min(1, "Dia inválido").max(31, "Dia inválido"),
  startDate: z.string().trim().min(1, "Informe a data de início"),
  endDate: z.string().trim().optional(),
});

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export async function createRecurringRuleAction(
  _prevState: RecurringActionState,
  formData: FormData,
): Promise<RecurringActionState> {
  const { workspace } = await requireActiveWorkspace();

  const parsed = ruleSchema.safeParse({
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    dayOfMonth: formData.get("dayOfMonth"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await recurringService.createRecurringRule(workspace.id, {
      ...parsed.data,
      startDate: parseDate(parsed.data.startDate),
      endDate: parsed.data.endDate ? parseDate(parsed.data.endDate) : null,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao criar regra" };
  }

  revalidatePath("/recorrencias");
  revalidatePath("/transacoes");
}

export async function toggleRecurringRuleAction(formData: FormData) {
  const { workspace } = await requireActiveWorkspace();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";

  await recurringService.setRecurringRuleActive(workspace.id, id, active);
  revalidatePath("/recorrencias");
}

export async function deleteRecurringRuleAction(formData: FormData) {
  const { workspace } = await requireActiveWorkspace();
  const id = String(formData.get("id") ?? "");

  await recurringService.deleteRecurringRule(workspace.id, id);
  revalidatePath("/recorrencias");
}

export async function generateRecurringNowAction(formData: FormData) {
  const { workspace } = await requireActiveWorkspace();
  void formData;

  await recurringService.generatePendingForMonth(workspace.id);
  revalidatePath("/transacoes");
  revalidatePath("/recorrencias");
  revalidatePath("/");
}
