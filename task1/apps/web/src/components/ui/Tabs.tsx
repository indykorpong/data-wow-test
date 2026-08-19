"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Tabs.module.css";

interface Tab {
  href: string;
  label: string;
}

/**
 * Overview / Create. These are real routes rather than local state, so each
 * view is linkable, reloadable and back-button friendly. Rendered as links with
 * `aria-current` instead of ARIA tabs, because that is what they behave like.
 */
export function Tabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav className={styles.tablist} aria-label="Admin sections">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
