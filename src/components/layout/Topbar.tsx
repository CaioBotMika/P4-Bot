import { LogOut } from "lucide-react";
import { logoutAction } from "@/server/auth/actions";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

type MembershipOption = {
  workspaceId: string;
  name: string;
  type: "PESSOAL" | "EMPRESA";
};

export function Topbar({
  userName,
  memberships,
  activeWorkspaceId,
}: {
  userName: string;
  memberships: MembershipOption[];
  activeWorkspaceId: string;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
      <WorkspaceSwitcher memberships={memberships} activeWorkspaceId={activeWorkspaceId} />

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-zinc-500 sm:inline dark:text-zinc-400">{userName}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </form>
      </div>
    </header>
  );
}
