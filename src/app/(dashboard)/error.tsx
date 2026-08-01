"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Card className="max-w-md text-center">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Algo deu errado
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          {error.message || "Não foi possível concluir a operação."}
        </p>
        <Button onClick={reset}>Tentar novamente</Button>
      </Card>
    </div>
  );
}
