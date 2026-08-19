import type { ReactNode } from "react";
import { BrandMark } from "@/components/layout/BrandMark";
import styles from "./layout.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.split}>
      <aside className={styles.panel}>
        <BrandMark size="lg" tone="light" />

        <div className={styles.quoteBlock}>
          <p className={styles.quote}>&ldquo;Powering the tools that power the team.&rdquo;</p>
          <p className={styles.blurb}>
            Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit
            ornare a. Proin dolor morbi id ornare aenean non.
          </p>
        </div>
      </aside>

      <main className={styles.formPane}>
        <div className={styles.formInner}>{children}</div>
      </main>
    </div>
  );
}
