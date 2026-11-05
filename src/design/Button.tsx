import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: boolean;
}

export function Button({ variant = "secondary", icon, className, ...props }: Props) {
  return (
    <button
      type="button"
      className={clsx(styles.btn, styles[variant], icon && styles.icon, className)}
      {...props}
    />
  );
}
