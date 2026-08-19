"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { workspaceFromPath } from "@/lib/workspace";
import { useRole } from "@/store/RoleContext";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  /** Called after any navigation so the mobile drawer closes behind the user. */
  onNavigate?: () => void;
}

interface NavLink {
  kind: "link";
  href: string;
  label: string;
  icon: IconName;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setRole } = useRole();

  // Derived from the route, not from RoleContext — see lib/workspace.ts.
  const isAdmin = workspaceFromPath(pathname) === "admin";

  // Admin gets Home + History; the user side has no History screen in the
  // design, so it gets Home only.
  const links: NavLink[] = isAdmin
    ? [
        { kind: "link", href: "/admin", label: "Home", icon: "home" },
        { kind: "link", href: "/admin/history", label: "History", icon: "inbox" },
      ]
    : [{ kind: "link", href: "/user", label: "Home", icon: "home" }];

  const handleSwitchRole = () => {
    const next = isAdmin ? "user" : "admin";
    setRole(next);
    router.push(next === "admin" ? "/admin" : "/user");
    onNavigate?.();
  };

  const handleLogout = () => {
    // No real session to clear this task — reset to the default role and send
    // the visitor back to the access-level screen.
    setRole("admin");
    router.push("/");
    onNavigate?.();
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>{isAdmin ? "Admin" : "User"}</span>
        <button type="button" className={styles.close} onClick={onNavigate} aria-label="Close menu">
          <Icon name="x" size={24} />
        </button>
      </div>

      <nav className={styles.nav} aria-label="Main">
        <ul>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.item} ${isActive ? styles.active : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onNavigate}
                >
                  <Icon name={link.icon} size={24} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}

          <li>
            <button type="button" className={styles.item} onClick={handleSwitchRole}>
              <Icon name="refresh-ccw" size={24} />
              <span>{isAdmin ? "Switch to user" : "Switch to Admin"}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className={styles.footer}>
        <button type="button" className={styles.item} onClick={handleLogout}>
          <Icon name="log-out" size={24} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
