import { useCallback, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { File, Folder, MoreHorizontal } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { formatBytes, formatDate } from "../../lib/format";
import { Popover } from "../../design/Popover";
import popoverStyles from "../../design/Popover.module.css";
import styles from "./FileTable.module.css";
import clsx from "clsx";
import { ParentRow } from "../layout/TopBar";

interface Props {
  onDownload: (key: string) => void;
  onDelete: (key: string) => void;
}

export function FileTable({ onDownload, onDelete }: Props) {
  const rows = useAppStore((s) => s.rows);
  const search = useAppStore((s) => s.search);
  const selectedKey = useAppStore((s) => s.selectedKey);
  const loading = useAppStore((s) => s.loading);
  const isTruncated = useAppStore((s) => s.isTruncated);
  const setPrefix = useAppStore((s) => s.setPrefix);
  const selectRow = useAppStore((s) => s.selectRow);
  const refreshListing = useAppStore((s) => s.refreshListing);
  const [menu, setMenu] = useState<{ key: string; anchor: HTMLElement } | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(query));
  }, [rows, search]);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  const objectCount = filtered.filter((row) => !row.isFolder).length;
  const folderCount = filtered.length - objectCount;
  const totalSize = filtered.reduce((sum, row) => sum + (row.isFolder ? 0 : row.size), 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.stats}>
        <span>{objectCount} objects</span>
        <span>{folderCount} folders</span>
        <span className="tabular">{formatBytes(totalSize)}</span>
        {loading && <span className="muted">Refreshing</span>}
      </div>
      <ParentRow />
      <div className={styles.tableHead}>
        <div>Name</div>
        <div>Size</div>
        <div>Modified</div>
        <div>Type</div>
        <div />
      </div>
      <div ref={parentRef} className={styles.scroll}>
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = filtered[virtualRow.index];
            return (
              <div
                key={row.key}
                className={clsx(styles.tr, selectedKey === row.key && styles.selected)}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
                onClick={() => {
                  if (row.isFolder) setPrefix(row.key);
                  else void selectRow(row);
                }}
              >
                <div className={styles.name}>
                  {row.isFolder ? <Folder size={14} /> : <File size={14} />}
                  <span>{row.name}</span>
                </div>
                <div className="tabular">{row.isFolder ? "" : formatBytes(row.size)}</div>
                <div className={styles.date}>{formatDate(row.lastModified)}</div>
                <div className={styles.type}>{row.isFolder ? "Folder" : "File"}</div>
                <div className={styles.menuCell}>
                  {!row.isFolder && (
                    <button
                      type="button"
                      className={clsx(styles.more, menu?.key === row.key && styles.moreOpen)}
                      aria-label={`Actions for ${row.name}`}
                      aria-expanded={menu?.key === row.key}
                      onClick={(event) => {
                        event.stopPropagation();
                        const anchor = event.currentTarget;
                        setMenu((current) =>
                          current?.key === row.key ? null : { key: row.key, anchor },
                        );
                      }}
                    >
                      <MoreHorizontal />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Popover anchor={menu?.anchor ?? null} open={menu !== null} onClose={closeMenu}>
        <button
          type="button"
          role="menuitem"
          className={popoverStyles.item}
          onClick={() => {
            const key = menu?.key;
            closeMenu();
            if (key) onDownload(key);
          }}
        >
          Download
        </button>
        <button
          type="button"
          role="menuitem"
          className={popoverStyles.item}
          onClick={() => {
            if (menu?.key) void navigator.clipboard.writeText(menu.key);
            closeMenu();
          }}
        >
          Copy key
        </button>
        <button
          type="button"
          role="menuitem"
          className={clsx(popoverStyles.item, popoverStyles.danger)}
          onClick={() => {
            const key = menu?.key;
            closeMenu();
            if (key) onDelete(key);
          }}
        >
          Delete
        </button>
      </Popover>
      {isTruncated && (
        <div className={styles.moreBar}>
          <button type="button" onClick={() => void refreshListing(true)}>
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
