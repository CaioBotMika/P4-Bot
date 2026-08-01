"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCategoryAction } from "@/server/categories/actions";
import { Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormError } from "@/components/ui/FormError";

export function CategoryForm() {
  const [state, formAction] = useActionState(createCategoryAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Input label="Nome" name="name" placeholder="Ex: Mercado" required />
      </div>
      <div className="w-40">
        <Select label="Tipo" name="kind" defaultValue="DESPESA">
          <option value="DESPESA">Despesa</option>
          <option value="RECEITA">Receita</option>
        </Select>
      </div>
      <div>
        <Input label="Cor" name="color" type="color" defaultValue="#6366f1" className="h-9 w-16 p-1" />
      </div>
      <SubmitButton pendingText="Adicionando...">Adicionar categoria</SubmitButton>
      <FormError message={state?.error} />
    </form>
  );
}
