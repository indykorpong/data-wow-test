import type { ReactNode } from "react";
import { StatCards } from "@/components/domain/StatCards";
import { Tabs } from "@/components/ui/Tabs";
import styles from "./layout.module.css";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/create", label: "Create" },
];

export default function AdminHomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="u-container">
      <div className={styles.home}>
        <StatCards />
        <Tabs tabs={TABS} />
        {children}
      </div>
    </div>
  );
}
