"use client";

import { useActionState, useState } from "react";
import {
  updateTransactionAction,
  deleteTransactionAction,
  markTransactionPaidAction,
  markTransactionPendingAction,
} from "@/server/transactions/actions";
import { Input, Textarea } from "@/components/ui/Field";
import { Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/format";
import { CategorySelectOptions } from "./CategorySelectOptions";

type Category = { id: string; name: string; kind: "RECEITA" | "DESPESA" };

export type TransactionRowData = {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  notes: string | null;
  status: "PENDENTE" | "PAGO";
  displayStatus: "PENDENTE" | "PAGO" | "ATRASADO";
  category: { id: string; name: string; color: string; kind: "RECEITA" | "DESPESA" };
};

const STATUS_TONE = {
  PAGO: "green",
  PENDENTE: "amber",
  ATRASADO: "red",
} as const;

const STATUS_LABEL = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  ATRASADO: "Atrasado",
} as const;

export function TransactionRow({
  transaction,
  categories,
}: {
  transaction: TransactionRowData;
  categories: Category[];
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(updateTransactionAction, undefined);

  if (editing) {
    return (
      <tr className="border-t border-zinc-100 dark:border-zinc-800">
        <td colSpan={6} className="px-3 py-3">
          <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input type="hidden" name="id" value={transaction.id} />
            <Select label="Categoria" name="categoryId" defaultValue={transaction.category.id} required>
              <CategorySelectOptions categories={categories} />
            </Select>
            <Input label="Descrição" name="description" defaultValue={transaction.description} required />
            <Input
              label="Valor (R$)"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={transaction.amount}
              required
            />
            <Input
              label="Vencimento"
              name="dueDate"
              type="date"
              defaultValue={toDateInputValue(transaction.dueDate)}
              required
            />
            <div className="flex items-end gap-2">
              <SubmitButton size="sm" pendingText="Salvando...">
                Salvar
              </SubmitButton>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Fechar
              </Button>
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
              <Textarea label="Observações" name="notes" defaultValue={transaction.notes ?? ""} rows={2} />
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
              <FormError message={state?.error} />
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-zinc-100 dark:border-zinc-800">
      <td className="px-3 py-3">
        <span
          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: transaction.category.color }}
        />
        {transaction.description}
        {transaction.notes ? (
          <p className="ml-4.5 text-xs text-zinc-400">{transaction.notes}</p>
        ) : null}
      </td>
      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{transaction.category.name}</td>
      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{formatDate(transaction.dueDate)}</td>
      <td
        className={
          "px-3 py-3 text-right font-medium " +
          (transaction.category.kind === "RECEITA"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400")
        }
      >
        {transaction.category.kind === "RECEITA" ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </td>
      <td className="px-3 py-3">
        <Badge tone={STATUS_TONE[transaction.displayStatus]}>{STATUS_LABEL[transaction.displayStatus]}</Badge>
      </td>
      <td className="px-3 py-3 text-right whitespace-nowrap">
        {transaction.status === "PAGO" ? (
          <form action={markTransactionPendingAction} className="inline">
            <input type="hidden" name="id" value={transaction.id} />
            <button type="submit" className="mr-3 text-sm text-amber-600 hover:underline dark:text-amber-400">
              Reabrir
            </button>
          </form>
        ) : (
          <form action={markTransactionPaidAction} className="inline">
            <input type="hidden" name="id" value={transaction.id} />
            <button type="submit" className="mr-3 text-sm text-emerald-600 hover:underline dark:text-emerald-400">
              Marcar pago
            </button>
          </form>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mr-3 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Editar
        </button>
        <form action={deleteTransactionAction} className="inline">
          <input type="hidden" name="id" value={transaction.id} />
          <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
            Excluir
          </button>
        </form>
      </td>
    </tr>
  );
}
