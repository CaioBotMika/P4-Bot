"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTransactionAction } from "@/server/transactions/actions";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";
import { CategorySelectOptions } from "./CategorySelectOptions";
import { toDateInputValue } from "@/lib/format";

type Category = { id: string; name: string; kind: "RECEITA" | "DESPESA" };

export function TransactionForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(createTransactionAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error) {
      formRef.current?.reset();
    }
  }, [state]);

  if (categories.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Cadastre pelo menos uma categoria antes de lançar transações.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Select label="Categoria" name="categoryId" defaultValue="" required>
        <CategorySelectOptions categories={categories} />
      </Select>
      <Input label="Descrição" name="description" placeholder="Ex: Conta de luz" required />
      <Input label="Valor (R$)" name="amount" type="number" step="0.01" min="0.01" required />
      <Input label="Vencimento" name="dueDate" type="date" defaultValue={toDateInputValue(new Date())} required />
      <div className="flex items-end">
        <SubmitButton className="w-full" pendingText="Adicionando...">
          Adicionar
        </SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-5">
        <Textarea label="Observações (opcional)" name="notes" rows={2} />
      </div>
      <div className="sm:col-span-2 lg:col-span-5">
        <FormError message={state?.error} />
      </div>
    </form>
  );
}
