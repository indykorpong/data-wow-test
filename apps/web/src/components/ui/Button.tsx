import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Button.module.css";

type Variant = "primary" | "danger" | "ghost";
type Size = "lg" | "md";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  /** Icon shown before the label — e.g. `save`, `trash-2`. */
  iconBefore?: IconName;
  /** Icon shown after the label — e.g. `arrow-right` on the access-level cards. */
  iconAfter?: IconName;
  children: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

type LinkProps = CommonProps & { href: string };

function classes({
  variant = "primary",
  size = "lg",
  fullWidth,
  className,
}: Pick<CommonProps, "variant" | "size" | "fullWidth" | "className">) {
  return [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Renders a `<button>`, or a Next `<Link>` when `href` is given — the design
 * uses the same visual control for both (Save submits, "Enter Workspace"
 * navigates), and a link that acts as a link keeps keyboard and
 * open-in-new-tab behaviour correct.
 */
export function Button(props: ButtonProps | LinkProps) {
  const {
    variant,
    size = "lg",
    fullWidth,
    iconBefore,
    iconAfter,
    children,
    className,
    // Whatever is left is a native attribute meant for the underlying element.
    ...rest
  } = props;
  const iconSize = size === "lg" ? 24 : 20;

  const content = (
    <>
      {iconBefore ? <Icon name={iconBefore} size={iconSize} /> : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} size={iconSize} /> : null}
    </>
  );

  const cx = classes({ variant, size, fullWidth, className });

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cx}>
        {content}
      </Link>
    );
  }

  // `rest` may still carry an explicit `href: undefined` from the button branch
  // of the union; React drops undefined attributes, so it never reaches the DOM.
  return (
    <button className={cx} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
