"use client";

import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import styles from "./Field.module.css";

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, rows = 3, ...textareaProps }: TextAreaProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={`${styles.control} ${styles.multiline} ${error ? styles.invalid : ""}`}>
        <textarea
          id={id}
          rows={rows}
          className={`${styles.input} ${styles.textarea}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...textareaProps}
        />
      </div>

      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
