"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { workspaceFromPath } from "@/lib/workspace";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = workspaceFromPath(pathname) === "admin";

  // Every control inside the drawer calls this on activation, so navigating
  // closes it without needing an effect to watch the pathname.
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Esc closes the drawer, and background scroll is frozen while it is open.
  useEffect(() => {
    if (!drawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  return (
    <div className={styles.shell}>
      {/* Desktop: a permanent 240px column. */}
      <aside className={styles.desktopSidebar}>
        <Sidebar />
      </aside>

      {/* Below 1024px: the same component, slid in from the left. */}
      {drawerOpen ? <div className={styles.scrim} onClick={closeDrawer} /> : null}
      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.open : ""}`}
        // Hidden from assistive tech while off-canvas, so its links are not
        // reachable by tab or screen reader when the drawer is shut. React 19
        // takes `inert` as a real boolean.
        inert={!drawerOpen}
      >
        <Sidebar onNavigate={closeDrawer} />
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.hamburger}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <Icon name="menu" size={24} />
          </button>
          <span className={styles.topbarTitle}>{isAdmin ? "Admin" : "User"}</span>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
