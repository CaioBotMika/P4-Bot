import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { requireActiveWorkspace } from "@/server/workspaces/guards";
import { generatePendingForMonth } from "@/server/recurring/service";
import { getMonthSummary, getExpensesByCategory, getMonthlySeries } from "@/server/dashboard/service";
import { Card } from "@/components/ui/Card";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { MonthlyBarChart } from "@/components/charts/MonthlyBarChart";

export default async function DashboardPage() {
  const { workspace } = await requireActiveWorkspace();
  const now = new Date();

  await generatePendingForMonth(workspace.id, now);

  const [summary, byCategory, series] = await Promise.all([
    getMonthSummary(workspace.id, now),
    getExpensesByCategory(workspace.id, now),
    getMonthlySeries(workspace.id, now),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{workspace.name}</h1>
        <p className="text-sm capitalize text-zinc-500 dark:text-zinc-400">
          {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      <SummaryCards summary={summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Despesas por categoria
          </h2>
          <CategoryPieChart data={byCategory} />
        </Card>
        <Card>
          <h2 className="mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Receitas x despesas (6 meses)
          </h2>
          <MonthlyBarChart data={series} />
        </Card>
      </div>
    </div>
  );
}
