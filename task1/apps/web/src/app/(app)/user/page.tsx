"use client";

import { ConcertCard } from "@/components/domain/ConcertCard";
import { Button } from "@/components/ui/Button";
import { useConcerts } from "@/store/ConcertsContext";
import { useToast } from "@/store/ToastContext";
import styles from "@/components/domain/ConcertList.module.css";

export default function UserHomePage() {
  const { state, isReserved, reserve, cancel } = useConcerts();
  const { showToast } = useToast();

  function toggle(concertId: string, concertName: string) {
    if (isReserved(concertId)) {
      cancel(concertId);
      showToast(`Cancelled your seat for ${concertName}`);
    } else {
      reserve(concertId);
      showToast(`Reserved a seat for ${concertName}`);
    }
  }

  return (
    <div className="u-container">
      <h1 className="u-sr-only">Concerts</h1>

      {state.concerts.length === 0 ? (
        <p className={styles.empty}>No concerts are available right now.</p>
      ) : (
        <div className={styles.list}>
          {state.concerts.map((concert) => {
            const reserved = isReserved(concert.id);
            return (
              <ConcertCard
                key={concert.id}
                concert={concert}
                prominent
                action={
                  <Button
                    variant={reserved ? "danger" : "primary"}
                    onClick={() => toggle(concert.id, concert.name)}
                  >
                    {reserved ? "Cancel" : "Reserve"}
                  </Button>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
