"use client";

import { useActionState, useState } from "react";
import { updateCategoryAction, deleteCategoryAction } from "@/server/categories/actions";
import { Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Badge } from "@/components/ui/Badge";

type Category = { id: string; name: string; kind: "RECEITA" | "DESPESA"; color: string };

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(updateCategoryAction, undefined);

  if (editing) {
    return (
      <tr className="border-t border-zinc-100 dark:border-zinc-800">
        <td colSpan={3} className="px-3 py-3">
          <form action={formAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={category.id} />
            <div className="w-48">
              <Input label="Nome" name="name" defaultValue={category.name} required />
            </div>
            <div className="w-40">
              <Select label="Tipo" name="kind" defaultValue={category.kind}>
                <option value="DESPESA">Despesa</option>
                <option value="RECEITA">Receita</option>
              </Select>
            </div>
            <Input label="Cor" name="color" type="color" defaultValue={category.color} className="h-9 w-16 p-1" />
            <SubmitButton size="sm" pendingText="Salvando...">
              Salvar
            </SubmitButton>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Fechar
            </Button>
          </form>
          <FormError message={state?.error} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-zinc-100 dark:border-zinc-800">
      <td className="px-3 py-3">
        <span
          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        {category.name}
      </td>
      <td className="px-3 py-3">
        <Badge tone={category.kind === "RECEITA" ? "green" : "red"}>
          {category.kind === "RECEITA" ? "Receita" : "Despesa"}
        </Badge>
      </td>
      <td className="px-3 py-3 text-right">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mr-3 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Editar
        </button>
        <form action={deleteCategoryAction} className="inline">
          <input type="hidden" name="id" value={category.id} />
          <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
            Excluir
          </button>
        </form>
      </td>
    </tr>
  );
}
