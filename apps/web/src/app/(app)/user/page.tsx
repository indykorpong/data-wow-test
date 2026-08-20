"use client";

import { useState } from "react";
import { ConcertCard } from "@/components/domain/ConcertCard";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api";
import { useConcerts } from "@/store/ConcertsContext";
import { useToast } from "@/store/ToastContext";
import styles from "@/components/domain/ConcertList.module.css";

export default function UserHomePage() {
  const { state, reserve, cancel } = useConcerts();
  const { showToast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggle(concertId: string, concertName: string, isMine: boolean) {
    setPendingId(concertId);
    try {
      if (isMine) {
        await cancel(concertId);
        showToast(`Cancelled your seat for ${concertName}`);
      } else {
        await reserve(concertId);
        showToast(`Reserved a seat for ${concertName}`);
      }
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Something went wrong.", "error");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="u-container">
      <h1 className="u-sr-only">Concerts</h1>

      {state.concerts.length === 0 ? (
        <p className={styles.empty}>
          {state.loading ? "Loading concerts…" : "No concerts are available right now."}
        </p>
      ) : (
        <div className={styles.list}>
          {state.concerts.map((concert) => {
            const isMine = concert.isReservedByMe;
            const isFull = concert.reservedSeats >= concert.totalSeats;
            const label = isMine ? "Cancel" : isFull ? "Fully booked" : "Reserve";
            return (
              <ConcertCard
                key={concert.id}
                concert={concert}
                prominent
                action={
                  <Button
                    variant={isMine ? "danger" : "primary"}
                    disabled={(!isMine && isFull) || pendingId === concert.id}
                    onClick={() => toggle(concert.id, concert.name, isMine)}
                  >
                    {label}
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
