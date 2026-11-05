import { useAppStore } from "../../store/appStore";
import { Button } from "../../design/Button";
import styles from "./EmptyState.module.css";

export function EmptyState() {
  const setConnectionFormOpen = useAppStore((s) => s.setConnectionFormOpen);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2>Open a bucket</h2>
        <p>Add a connection, then browse folders and files in one place.</p>
        <Button variant="primary" onClick={() => setConnectionFormOpen(true)}>
          Add connection
        </Button>
      </div>
    </div>
  );
}
