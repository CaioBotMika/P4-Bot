import { toggleRecurringRuleAction, deleteRecurringRuleAction } from "@/server/recurring/actions";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";

export type RecurringRuleData = {
  id: string;
  description: string;
  amount: number;
  dayOfMonth: number;
  active: boolean;
  category: { name: string; color: string; kind: "RECEITA" | "DESPESA" };
};

export function RecurringRow({ rule }: { rule: RecurringRuleData }) {
  return (
    <tr className="border-t border-zinc-100 dark:border-zinc-800">
      <td className="px-3 py-3">
        <span
          className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: rule.category.color }}
        />
        {rule.description}
      </td>
      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{rule.category.name}</td>
      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">Dia {rule.dayOfMonth}</td>
      <td
        className={
          "px-3 py-3 text-right font-medium " +
          (rule.category.kind === "RECEITA"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400")
        }
      >
        {rule.category.kind === "RECEITA" ? "+" : "-"}
        {formatCurrency(rule.amount)}
      </td>
      <td className="px-3 py-3">
        <Badge tone={rule.active ? "green" : "zinc"}>{rule.active ? "Ativa" : "Pausada"}</Badge>
      </td>
      <td className="px-3 py-3 text-right whitespace-nowrap">
        <form action={toggleRecurringRuleAction} className="inline">
          <input type="hidden" name="id" value={rule.id} />
          <input type="hidden" name="active" value={(!rule.active).toString()} />
          <button type="submit" className="mr-3 text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            {rule.active ? "Pausar" : "Reativar"}
          </button>
        </form>
        <form action={deleteRecurringRuleAction} className="inline">
          <input type="hidden" name="id" value={rule.id} />
          <button type="submit" className="text-sm text-red-600 hover:underline dark:text-red-400">
            Excluir
          </button>
        </form>
      </td>
    </tr>
  );
}
