import "server-only";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { getActiveWorkspace } from "./service";

/** Guarda central: garante usuário autenticado + workspace ativo válido. */
export async function requireActiveWorkspace() {
  const user = await requireUser();
  const workspace = await getActiveWorkspace(user.id);

  if (!workspace) {
    redirect("/login");
  }

  return { user, workspace };
}
