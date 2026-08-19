"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { useConcerts } from "@/store/ConcertsContext";
import styles from "./StatCards.module.css";

interface Stat {
  key: "seats" | "reserved" | "cancelled";
  label: string;
  value: number;
  icon: IconName;
}

export function StatCards() {
  const { stats } = useConcerts();

  // Values are projections of the store, so creating, deleting, reserving or
  // cancelling moves these numbers immediately.
  const cards: Stat[] = [
    { key: "seats", label: "Total of seats", value: stats.totalSeats, icon: "user" },
    { key: "reserved", label: "Reserve", value: stats.reserved, icon: "award" },
    { key: "cancelled", label: "Cancel", value: stats.cancelled, icon: "x-circle" },
  ];

  return (
    <section className={styles.grid} aria-label="Seat summary">
      {cards.map((card) => (
        <article key={card.key} className={`${styles.card} ${styles[card.key]}`}>
          <Icon name={card.icon} size={40} className={styles.icon} />
          <div className={styles.text}>
            <p className={styles.label}>{card.label}</p>
            <p className={styles.value}>{card.value.toLocaleString("en-US")}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
