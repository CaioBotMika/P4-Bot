import Link from "next/link";
import { addMonths, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/cn";

const STATUS_OPTIONS = [
  { value: undefined, label: "Todos" },
  { value: "PENDENTE", label: "Pendentes" },
  { value: "PAGO", label: "Pagos" },
] as const;

export function TransactionFilters({
  referenceDate,
  status,
}: {
  referenceDate: Date;
  status?: string;
}) {
  const monthParam = format(referenceDate, "yyyy-MM");
  const prevMonth = format(subMonths(referenceDate, 1), "yyyy-MM");
  const nextMonth = format(addMonths(referenceDate, 1), "yyyy-MM");

  function buildHref(month: string, statusValue?: string) {
    const params = new URLSearchParams({ month });
    if (statusValue) params.set("status", statusValue);
    return `/transacoes?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(prevMonth, status)}
          className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ←
        </Link>
        <span className="min-w-32 text-center text-sm font-medium capitalize text-zinc-700 dark:text-zinc-300">
          {format(referenceDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <Link
          href={buildHref(nextMonth, status)}
          className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          →
        </Link>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        {STATUS_OPTIONS.map((option) => {
          const isActive = option.value === status || (!option.value && !status);
          return (
            <Link
              key={option.label}
              href={buildHref(monthParam, option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-zinc-900 dark:text-indigo-300"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
