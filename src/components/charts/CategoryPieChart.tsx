"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

export type CategorySlice = { categoryId: string; name: string; color: string; total: number };

export function CategoryPieChart({ data }: { data: CategorySlice[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
        Nenhuma despesa registrada neste mês.
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-3 space-y-1.5">
        {data.map((entry) => (
          <li key={entry.categoryId} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(entry.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
