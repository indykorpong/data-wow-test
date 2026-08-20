import type { Role } from "./types";

/**
 * Which workspace a URL belongs to.
 *
 * The chrome (Sidebar/AppShell) derives its nav links and header title from
 * the route rather than from the authenticated user's role. The two always
 * agree in practice — `(app)/layout.tsx` redirects away from a mismatched
 * route — but deriving from the URL keeps the chrome correct even mid-render,
 * before that redirect has run.
 */
export function workspaceFromPath(pathname: string): Role {
  return pathname.startsWith("/user") ? "user" : "admin";
}
