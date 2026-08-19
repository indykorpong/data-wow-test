"use client";

import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Field.module.css";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  iconBefore?: IconName;
  /** Trailing decorative icon — e.g. the `user` glyph on "Total of seat". */
  iconAfter?: IconName;
  /** Adds the eye / eye-off reveal toggle. Only meaningful for `type="password"`. */
  revealToggle?: boolean;
  error?: string;
}

export function TextField({
  label,
  iconBefore,
  iconAfter,
  revealToggle = false,
  error,
  type = "text",
  ...inputProps
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [revealed, setRevealed] = useState(false);

  // Swapping the type is what actually reveals the value; the icon follows it.
  const resolvedType = revealToggle && revealed ? "text" : type;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={`${styles.control} ${error ? styles.invalid : ""}`}>
        {iconBefore ? <Icon name={iconBefore} size={24} className={styles.icon} /> : null}

        <input
          id={id}
          type={resolvedType}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />

        {iconAfter ? <Icon name={iconAfter} size={24} className={styles.icon} /> : null}

        {revealToggle ? (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
          >
            <Icon name={revealed ? "eye" : "eye-off"} size={24} />
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
