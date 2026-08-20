"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/layout/BrandMark";
import { useAuth } from "@/store/AuthContext";
import styles from "./layout.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    router.replace(user.role === "ADMIN" ? "/admin" : "/user");
  }, [status, user, router]);

  // Already signed in: render nothing while the redirect above takes over,
  // rather than flashing the login form first.
  if (status === "authenticated") return null;

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
