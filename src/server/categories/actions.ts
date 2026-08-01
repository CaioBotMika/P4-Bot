"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireActiveWorkspace } from "@/server/workspaces/guards";
import * as categoriesService from "./service";

export type CategoryActionState = { error?: string } | undefined;

const categorySchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(60, "Nome muito longo"),
  kind: z.enum(["RECEITA", "DESPESA"]),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
    .default("#6366f1"),
});

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const { workspace } = await requireActiveWorkspace();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await categoriesService.createCategory(workspace.id, parsed.data);
  revalidatePath("/categorias");
  revalidatePath("/transacoes");
}

export async function updateCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const { workspace } = await requireActiveWorkspace();

  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    color: formData.get("color") || undefined,
  });

  if (!id || !parsed.success) {
    return { error: parsed.success ? "Categoria inválida" : parsed.error.issues[0]?.message };
  }

  try {
    await categoriesService.updateCategory(workspace.id, id, parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao atualizar categoria" };
  }

  revalidatePath("/categorias");
  revalidatePath("/transacoes");
}

export async function deleteCategoryAction(formData: FormData) {
  const { workspace } = await requireActiveWorkspace();
  const id = String(formData.get("id") ?? "");

  await categoriesService.deleteCategory(workspace.id, id);
  revalidatePath("/categorias");
  revalidatePath("/transacoes");
}
