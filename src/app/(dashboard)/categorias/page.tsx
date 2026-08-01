import { requireActiveWorkspace } from "@/server/workspaces/guards";
import { listCategories } from "@/server/categories/service";
import { Card } from "@/components/ui/Card";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryRow } from "@/components/categories/CategoryRow";

export default async function CategoriasPage() {
  const { workspace } = await requireActiveWorkspace();
  const categories = await listCategories(workspace.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Categorias</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Categorias de {workspace.name} — usadas para organizar transações e recorrências.
        </p>
      </div>

      <Card>
        <CategoryForm />
      </Card>

      <Card className="p-0">
        {categories.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma categoria cadastrada ainda.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
                <th className="px-3 py-3 font-medium">Nome</th>
                <th className="px-3 py-3 font-medium">Tipo</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
