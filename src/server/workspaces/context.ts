import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "activeWorkspaceId";

export async function getActiveWorkspaceIdCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setActiveWorkspaceIdCookie(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, workspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
