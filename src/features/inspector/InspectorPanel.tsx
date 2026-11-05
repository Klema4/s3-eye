import { Fragment } from "react";
import { useAppStore } from "../../store/appStore";
import { EMPTY_VALUE, formatBytes, formatDate } from "../../lib/format";
import styles from "./InspectorPanel.module.css";
import clsx from "clsx";

export function InspectorPanel() {
  const open = useAppStore((s) => s.inspectorOpen);
  const head = useAppStore((s) => s.head);
  const preview = useAppStore((s) => s.preview);
  const selectedKey = useAppStore((s) => s.selectedKey);
  const activities = useAppStore((s) => s.activities);

  if (!open) return null;

  const imageSrc =
    preview?.base64 && preview.mime
      ? `data:${preview.mime};base64,${preview.base64}`
      : null;

  return (
    <aside className={styles.panel} aria-label="Inspector">
      <h2 className={styles.heading}>Inspector</h2>

      {!selectedKey && <p className={styles.muted}>Select an object to view details.</p>}

      {selectedKey && (
        <>
          <section className={styles.block}>
            <h3>Preview</h3>
            {preview?.tooLarge && (
              <p className={styles.muted}>Preview is limited to 2 MB.</p>
            )}
            {preview?.text && (
              <pre className={styles.previewText}>{preview.text.slice(0, 8000)}</pre>
            )}
            {imageSrc && (
              <img src={imageSrc} alt="" className={styles.previewImg} />
            )}
            {!preview?.text && !imageSrc && !preview?.tooLarge && (
              <p className={styles.muted}>Preview is not available for this object.</p>
            )}
          </section>

          {head && (
            <section className={styles.block}>
              <h3>Metadata</h3>
              <dl className={styles.dl}>
                <dt>Key</dt>
                <dd>{head.key}</dd>
                <dt>Size</dt>
                <dd className="tabular">{formatBytes(head.size)}</dd>
                <dt>Modified</dt>
                <dd>{formatDate(head.lastModified)}</dd>
                <dt>Content type</dt>
                <dd>{head.contentType ?? EMPTY_VALUE}</dd>
                <dt>ETag</dt>
                <dd>{head.etag ?? EMPTY_VALUE}</dd>
                <dt>Storage class</dt>
                <dd>{head.storageClass ?? EMPTY_VALUE}</dd>
                {Object.entries(head.metadata).map(([k, v]) => (
                  <Fragment key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </Fragment>
                ))}
              </dl>
            </section>
          )}
        </>
      )}

      <section className={styles.block}>
        <h3>Activity</h3>
        <ul className={styles.activity}>
          {activities.map((a) => (
            <li key={a.id} className={clsx(styles.activityItem, styles[a.status])}>
              <span>{a.label}</span>
              <time>{new Date(a.at).toLocaleTimeString()}</time>
            </li>
          ))}
          {activities.length === 0 && <li className={styles.muted}>No recent activity</li>}
        </ul>
      </section>
    </aside>
  );
}
