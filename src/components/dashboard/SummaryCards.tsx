import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";

export type MonthSummary = {
  receitas: number;
  despesas: number;
  saldo: number;
  receitasPendentes: number;
  despesasPendentes: number;
};

export function SummaryCards({ summary }: { summary: MonthSummary }) {
  const items: { label: string; value: number; tone: string }[] = [
    { label: "Receitas (pagas)", value: summary.receitas, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Despesas (pagas)", value: summary.despesas, tone: "text-red-600 dark:text-red-400" },
    {
      label: "Saldo do mês",
      value: summary.saldo,
      tone: summary.saldo >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
    },
    { label: "A receber (pendente)", value: summary.receitasPendentes, tone: "text-zinc-700 dark:text-zinc-300" },
    { label: "A pagar (pendente)", value: summary.despesasPendentes, tone: "text-zinc-700 dark:text-zinc-300" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.label}</p>
          <p className={`mt-1 text-xl font-semibold ${item.tone}`}>{formatCurrency(item.value)}</p>
        </Card>
      ))}
    </div>
  );
}
