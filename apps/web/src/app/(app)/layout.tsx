"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { workspaceFromPath } from "@/lib/workspace";
import { useAuth } from "@/store/AuthContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const ownWorkspace = user ? (user.role === "ADMIN" ? "admin" : "user") : null;
  const authorized = status === "authenticated" && ownWorkspace === workspaceFromPath(pathname);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (ownWorkspace && !authorized) {
      router.replace(ownWorkspace === "admin" ? "/admin" : "/user");
    }
  }, [status, ownWorkspace, authorized, router]);

  // Nothing to render until we know who's asking and the route matches their
  // role — avoids a flash of the wrong workspace's chrome mid-redirect.
  if (!authorized) return null;

  return <AppShell>{children}</AppShell>;
}
