import { requireActiveWorkspace } from "@/server/workspaces/guards";
import { listMembershipsForUser } from "@/server/workspaces/service";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace } = await requireActiveWorkspace();
  const memberships = await listMembershipsForUser(user.id);

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={user.name}
          activeWorkspaceId={workspace.id}
          memberships={memberships.map((m) => ({
            workspaceId: m.workspace.id,
            name: m.workspace.name,
            type: m.workspace.type,
          }))}
        />
        <MobileNav />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
