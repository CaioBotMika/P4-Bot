"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { requireWorkspaceAccess } from "./service";
import { setActiveWorkspaceIdCookie } from "./context";

export async function switchWorkspaceAction(formData: FormData) {
  const user = await requireUser();
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  await requireWorkspaceAccess(user.id, workspaceId);
  await setActiveWorkspaceIdCookie(workspaceId);

  redirect(redirectTo);
}
