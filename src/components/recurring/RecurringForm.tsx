"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRecurringRuleAction } from "@/server/recurring/actions";
import { Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { CategorySelectOptions } from "@/components/transactions/CategorySelectOptions";
import { toDateInputValue } from "@/lib/format";

type Category = { id: string; name: string; kind: "RECEITA" | "DESPESA" };

export function RecurringForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(createRecurringRuleAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error) {
      formRef.current?.reset();
    }
  }, [state]);

  if (categories.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Cadastre pelo menos uma categoria antes de criar recorrências.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <Select label="Categoria" name="categoryId" defaultValue="" required>
        <CategorySelectOptions categories={categories} />
      </Select>
      <Input label="Descrição" name="description" placeholder="Ex: Aluguel" required />
      <Input label="Valor (R$)" name="amount" type="number" step="0.01" min="0.01" required />
      <Input label="Dia do mês" name="dayOfMonth" type="number" min="1" max="31" defaultValue={5} required />
      <Input label="Início" name="startDate" type="date" defaultValue={toDateInputValue(new Date())} required />
      <div className="flex items-end">
        <SubmitButton className="w-full" pendingText="Criando...">
          Criar recorrência
        </SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-6">
        <FormError message={state?.error} />
      </div>
    </form>
  );
}
