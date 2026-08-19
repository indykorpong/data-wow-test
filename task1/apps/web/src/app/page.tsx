"use client";

import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useRole } from "@/store/RoleContext";
import type { Role } from "@/lib/types";
import styles from "./page.module.css";

interface AccessCard {
  role: Role;
  title: string;
  cta: string;
  icon: IconName;
  body: string;
}

const CARDS: AccessCard[] = [
  {
    role: "user",
    title: "User",
    cta: "Enter Workspace",
    icon: "users",
    body: "Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non",
  },
  {
    role: "admin",
    title: "Administrator",
    cta: "Enter Portal",
    icon: "user-check",
    body: "Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non",
  },
];

export default function AccessLevelPage() {
  const router = useRouter();
  const { setRole } = useRole();

  // Picking a role here is what the rest of the app reads; the design then
  // sends the visitor through the (UI-only) login screen.
  function choose(role: Role) {
    setRole(role);
    router.push("/login");
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <BrandMark size="sm" />
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={styles.title}>Select Access Level</h1>
          <p className={styles.subtitle}>
            Lorem ipsum dolor sit amet consectetur. Elit purus nam.
          </p>
        </div>

        <div className={styles.cards}>
          {CARDS.map((card) => (
            <section key={card.role} className={styles.card}>
              <Icon name={card.icon} size={90} strokeWidth={1.25} className={styles.icon} />
              <h2 className={styles.cardTitle}>{card.title}</h2>
              <p className={styles.cardBody}>{card.body}</p>
              <Button fullWidth iconAfter="arrow-right" onClick={() => choose(card.role)}>
                {card.cta}
              </Button>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
