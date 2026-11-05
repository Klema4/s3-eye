import { X } from "lucide-react";
import { useAppStore } from "../store/appStore";
import styles from "./ToastStack.module.css";
import clsx from "clsx";

export function ToastStack() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  return (
    <div className={styles.stack} aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(styles.toast, styles[t.status])}
          role="status"
        >
          <span>{t.message}</span>
          <button type="button" className={styles.dismiss} onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <X />
          </button>
        </div>
      ))}
    </div>
  );
}
