import { switchWorkspaceAction } from "@/server/workspaces/actions";
import { cn } from "@/lib/cn";

type MembershipOption = {
  workspaceId: string;
  name: string;
  type: "PESSOAL" | "EMPRESA";
};

export function WorkspaceSwitcher({
  memberships,
  activeWorkspaceId,
}: {
  memberships: MembershipOption[];
  activeWorkspaceId: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
      {memberships.map((membership) => {
        const isActive = membership.workspaceId === activeWorkspaceId;
        return (
          <form key={membership.workspaceId} action={switchWorkspaceAction}>
            <input type="hidden" name="workspaceId" value={membership.workspaceId} />
            <button
              type="submit"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-zinc-900 dark:text-indigo-300"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              {membership.type === "PESSOAL" ? "🏠 " : "🏢 "}
              {membership.name}
            </button>
          </form>
        );
      })}
    </div>
  );
}
