import { parse, isValid, startOfMonth } from "date-fns";
import { requireActiveWorkspace } from "@/server/workspaces/guards";
import { listTransactions, deriveDisplayStatus } from "@/server/transactions/service";
import { listCategories } from "@/server/categories/service";
import { generatePendingForMonth } from "@/server/recurring/service";
import { Card } from "@/components/ui/Card";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionRow } from "@/components/transactions/TransactionRow";

type PageSearchParams = Promise<{ month?: string; status?: string }>;

function parseReferenceDate(month?: string) {
  if (!month) return new Date();
  const parsed = parse(`${month}-01`, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : new Date();
}

export default async function TransacoesPage({ searchParams }: { searchParams: PageSearchParams }) {
  const { workspace } = await requireActiveWorkspace();
  const params = await searchParams;
  const referenceDate = parseReferenceDate(params.month);
  const status = params.status === "PENDENTE" || params.status === "PAGO" ? params.status : undefined;

  if (startOfMonth(referenceDate) >= startOfMonth(new Date())) {
    await generatePendingForMonth(workspace.id, referenceDate);
  }

  const [transactions, categories] = await Promise.all([
    listTransactions(workspace.id, { month: referenceDate, status }),
    listCategories(workspace.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Transações</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Contas a pagar, a receber e despesas de {workspace.name}.
        </p>
      </div>

      <Card>
        <TransactionForm categories={categories} />
      </Card>

      <TransactionFilters referenceDate={referenceDate} status={status} />

      <Card className="p-0">
        {transactions.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum lançamento encontrado neste período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
                  <th className="px-3 py-3 font-medium">Descrição</th>
                  <th className="px-3 py-3 font-medium">Categoria</th>
                  <th className="px-3 py-3 font-medium">Vencimento</th>
                  <th className="px-3 py-3 text-right font-medium">Valor</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    categories={categories}
                    transaction={{
                      id: transaction.id,
                      description: transaction.description,
                      amount: Number(transaction.amount),
                      dueDate: transaction.dueDate,
                      notes: transaction.notes,
                      status: transaction.status === "PAGO" ? "PAGO" : "PENDENTE",
                      displayStatus: deriveDisplayStatus(transaction),
                      category: transaction.category,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
