"use client";

import { useState } from "react";
import { ConcertCard } from "@/components/domain/ConcertCard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useConcerts } from "@/store/ConcertsContext";
import { useToast } from "@/store/ToastContext";
import styles from "@/components/domain/ConcertList.module.css";

export default function AdminOverviewPage() {
  const { state, deleteConcert } = useConcerts();
  const { showToast } = useToast();

  // Holds the concert awaiting confirmation. `null` means the dialog is closed.
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteConcert(pendingDelete.id);
    showToast("Delete successfully");
    setPendingDelete(null);
  }

  if (state.concerts.length === 0) {
    return <p className={styles.empty}>No concerts yet. Use the Create tab to add one.</p>;
  }

  return (
    <>
      <div className={styles.list}>
        {state.concerts.map((concert) => (
          <ConcertCard
            key={concert.id}
            concert={concert}
            action={
              <Button
                variant="danger"
                iconBefore="trash-2"
                onClick={() => setPendingDelete({ id: concert.id, name: concert.name })}
              >
                Delete
              </Button>
            }
          />
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Are you sure to delete? "${pendingDelete?.name ?? ""}"`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
