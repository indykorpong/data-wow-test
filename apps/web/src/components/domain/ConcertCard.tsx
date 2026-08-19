import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Concert } from "@/lib/types";
import styles from "./ConcertCard.module.css";

interface ConcertCardProps {
  concert: Concert;
  /** The one control this card exposes: Delete for admin, Reserve/Cancel for user. */
  action?: ReactNode;
  /** Larger title, matching the User-home frame. */
  prominent?: boolean;
}

export function ConcertCard({ concert, action, prominent = false }: ConcertCardProps) {
  return (
    <article className={`${styles.card} ${prominent ? styles.prominent : ""}`}>
      <h2 className={styles.title}>{concert.name}</h2>
      <hr className={styles.rule} />
      <p className={styles.description}>{concert.description}</p>

      <div className={styles.footer}>
        <p className={styles.seats}>
          <Icon name="user" size={32} />
          <span>{concert.totalSeats.toLocaleString("en-US")}</span>
          <span className="u-sr-only">seats</span>
        </p>
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
    </article>
  );
}
