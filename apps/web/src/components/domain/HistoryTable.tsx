"use client";

import { formatDateTime } from "@/lib/format";
import { useConcerts } from "@/store/ConcertsContext";
import styles from "./HistoryTable.module.css";

export function HistoryTable() {
  const { state } = useConcerts();
  const { history } = state;

  if (history.length === 0) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>No activity yet. Reserve or cancel a seat to see it here.</p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <caption className="u-sr-only">Reservation history, most recent first</caption>

          <thead className={styles.thead}>
            <tr>
              <th scope="col" className={styles.th}>
                Date time
              </th>
              <th scope="col" className={styles.th}>
                Username
              </th>
              <th scope="col" className={styles.th}>
                Concert name
              </th>
              <th scope="col" className={styles.th}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {history.map((entry) => (
              <tr key={entry.id} className={styles.row}>
                {/* data-label drives the phone layout's inline headings. */}
                <td className={`${styles.td} ${styles.time}`} data-label="Date time">
                  {formatDateTime(entry.dateTime)}
                </td>
                <td className={styles.td} data-label="Username">
                  {entry.username}
                </td>
                <td className={styles.td} data-label="Concert name">
                  {entry.concertName}
                </td>
                <td className={styles.td} data-label="Action">
                  <span className={`${styles.badge} ${styles[entry.action]}`}>{entry.action}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
