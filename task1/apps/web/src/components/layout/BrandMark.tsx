import styles from "./BrandMark.module.css";

interface BrandMarkProps {
  /** `lg` is the 48px auth lockup; `sm` is the 24px top-bar lockup. */
  size?: "lg" | "sm";
  /** Inverts the wordmark for the dark brand panel and sidebar. */
  tone?: "light" | "dark";
}

export function BrandMark({ size = "lg", tone = "dark" }: BrandMarkProps) {
  return (
    <span className={`${styles.brand} ${styles[size]} ${styles[tone]}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.word}>BRAND</span>
    </span>
  );
}
