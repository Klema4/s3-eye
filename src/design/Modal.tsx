import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./Modal.module.css";
import { Button } from "./Button";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function Modal({ open, title, onClose, children, width = 480 }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2>{title}</h2>
          <Button icon variant="ghost" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
