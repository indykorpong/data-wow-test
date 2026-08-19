import type { Role } from "./types";

/**
 * Which workspace a URL belongs to.
 *
 * The chrome derives the workspace from the route rather than from RoleContext,
 * because the two can legitimately disagree: state resets to "admin" on reload,
 * so opening or refreshing /user directly would otherwise render the admin
 * sidebar. The route is the authority for what is on screen; RoleContext holds
 * the visitor's *choice* from the access-level screen, which is what the login
 * label and post-login redirect read.
 */
export function workspaceFromPath(pathname: string): Role {
  return pathname.startsWith("/user") ? "user" : "admin";
}
