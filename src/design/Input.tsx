import clsx from "clsx";
import { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(styles.input, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(styles.input, styles.textarea, className)} {...props} />;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className={styles.label}>{children}</label>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
