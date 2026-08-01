import { requireActiveWorkspace } from "@/server/workspaces/guards";
import { listRecurringRules } from "@/server/recurring/service";
import { listCategories } from "@/server/categories/service";
import { generateRecurringNowAction } from "@/server/recurring/actions";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { RecurringForm } from "@/components/recurring/RecurringForm";
import { RecurringRow } from "@/components/recurring/RecurringRow";

export default async function RecorrenciasPage() {
  const { workspace } = await requireActiveWorkspace();

  const [rules, categories] = await Promise.all([
    listRecurringRules(workspace.id),
    listCategories(workspace.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Recorrências</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Despesas e receitas fixas de {workspace.name}. Os lançamentos do mês são gerados
          automaticamente ao acessar o Dashboard ou as Transações.
        </p>
      </div>

      <Card>
        <RecurringForm categories={categories} />
      </Card>

      <div className="flex justify-end">
        <form action={generateRecurringNowAction}>
          <SubmitButton variant="secondary" pendingText="Gerando...">
            Gerar lançamentos do mês agora
          </SubmitButton>
        </form>
      </div>

      <Card className="p-0">
        {rules.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma recorrência cadastrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
                  <th className="px-3 py-3 font-medium">Descrição</th>
                  <th className="px-3 py-3 font-medium">Categoria</th>
                  <th className="px-3 py-3 font-medium">Repetição</th>
                  <th className="px-3 py-3 text-right font-medium">Valor</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <RecurringRow
                    key={rule.id}
                    rule={{
                      id: rule.id,
                      description: rule.description,
                      amount: Number(rule.amount),
                      dayOfMonth: rule.dayOfMonth,
                      active: rule.active,
                      category: rule.category,
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
