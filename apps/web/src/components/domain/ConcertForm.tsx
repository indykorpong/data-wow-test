"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import { useConcerts } from "@/store/ConcertsContext";
import { useToast } from "@/store/ToastContext";
import styles from "./ConcertForm.module.css";

interface Errors {
  name?: string;
  totalSeats?: string;
  description?: string;
}

export function ConcertForm() {
  const { createConcert } = useConcerts();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  // Drop a field's message as soon as the user edits it — leaving "is required"
  // beside a field they have just filled in is simply wrong. Returns the same
  // object when there is nothing to clear, so typing does not cause re-renders.
  function clearError(key: keyof Errors) {
    setErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous));
  }

  function validate(): Errors {
    const next: Errors = {};

    if (!name.trim()) {
      next.name = "Concert name is required.";
    }

    const seats = Number(totalSeats);
    if (!totalSeats.trim()) {
      next.totalSeats = "Total of seat is required.";
    } else if (!Number.isInteger(seats) || seats <= 0) {
      next.totalSeats = "Enter a whole number greater than zero.";
    }

    if (!description.trim()) {
      next.description = "Description is required.";
    }

    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    createConcert({
      name: name.trim(),
      description: description.trim(),
      totalSeats: Number(totalSeats),
    });

    showToast("Create successfully");

    setName("");
    setTotalSeats("");
    setDescription("");
  }

  return (
    // noValidate: the messages above are the ones we want shown, not the
    // browser's native bubbles.
    <form className={styles.panel} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>Create</h2>
      <hr className={styles.rule} />

      <div className={styles.fields}>
        <div className={styles.row}>
          <TextField
            label="Concert Name"
            placeholder="Please input concert name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
            error={errors.name}
          />

          <TextField
            label="Total of seat"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="500"
            iconAfter="user"
            value={totalSeats}
            onChange={(event) => {
              setTotalSeats(event.target.value);
              clearError("totalSeats");
            }}
            error={errors.totalSeats}
          />
        </div>

        <TextArea
          label="Description"
          placeholder="Please input description"
          rows={3}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            clearError("description");
          }}
          error={errors.description}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" iconBefore="save">
          Save
        </Button>
      </div>
    </form>
  );
}
