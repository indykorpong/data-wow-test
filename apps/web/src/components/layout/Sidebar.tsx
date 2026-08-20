"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { workspaceFromPath } from "@/lib/workspace";
import { useAuth } from "@/store/AuthContext";
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
  const { logout } = useAuth();

  // Derived from the route — see lib/workspace.ts.
  const isAdmin = workspaceFromPath(pathname) === "admin";

  const links: NavLink[] = isAdmin
    ? [
        { kind: "link", href: "/admin", label: "Home", icon: "home" },
        { kind: "link", href: "/admin/history", label: "History", icon: "inbox" },
      ]
    : [
        { kind: "link", href: "/user", label: "Home", icon: "home" },
        { kind: "link", href: "/user/history", label: "History", icon: "inbox" },
      ];

  const handleLogout = () => {
    logout();
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
