import { ChevronRight, FolderPlus, PanelRight, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { Button } from "../../design/Button";
import { parentPrefix } from "../../lib/format";
import styles from "./TopBar.module.css";

interface Props {
  onUpload: () => void;
  onDelete: () => void;
  onNewFolder: () => void;
  onOpenPalette: () => void;
}

export function TopBar({ onUpload, onDelete, onNewFolder, onOpenPalette }: Props) {
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const prefix = useAppStore((s) => s.prefix);
  const search = useAppStore((s) => s.search);
  const selectedKey = useAppStore((s) => s.selectedKey);
  const loading = useAppStore((s) => s.loading);
  const setPrefix = useAppStore((s) => s.setPrefix);
  const setSearch = useAppStore((s) => s.setSearch);
  const refreshListing = useAppStore((s) => s.refreshListing);
  const toggleInspector = useAppStore((s) => s.toggleInspector);

  const profile = profiles.find((item) => item.id === activeProfileId);
  const segments = buildSegments(prefix);

  return (
    <header className={styles.bar}>
      <div className={styles.identity}>
        <p className={styles.kicker}>{profile ? profile.bucket : "Bucket"}</p>
        <h1 className={styles.title}>{profile?.name ?? "No connection"}</h1>
      </div>

      <button type="button" className={styles.search} onClick={onOpenPalette}>
        <Search size={14} />
        <span>Find an object</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div className={styles.actions}>
        <Button icon variant="ghost" onClick={() => void refreshListing()} disabled={loading || !activeProfileId} aria-label="Refresh">
          <RefreshCw />
        </Button>
        <Button icon variant="ghost" onClick={onNewFolder} disabled={!activeProfileId} aria-label="New folder">
          <FolderPlus />
        </Button>
        <Button icon variant="ghost" onClick={onDelete} disabled={!selectedKey} aria-label="Delete">
          <Trash2 />
        </Button>
        <Button icon variant="ghost" onClick={() => toggleInspector()} aria-label="Toggle inspector">
          <PanelRight />
        </Button>
        <Button variant="primary" onClick={onUpload} disabled={!activeProfileId}>
          <Upload size={14} />
          Upload
        </Button>
      </div>

      <nav className={styles.crumbRow} aria-label="Prefix">
        <button type="button" className={styles.crumb} onClick={() => setPrefix("")}>
          Root
        </button>
        {segments.map((segment) => (
          <span key={segment.prefix} className={styles.crumbWrap}>
            <ChevronRight size={12} className={styles.sep} />
            <button type="button" className={styles.crumb} onClick={() => setPrefix(segment.prefix)}>
              {segment.label}
            </button>
          </span>
        ))}
        <label className={styles.filter}>
          <span className="sr-only">Filter current folder</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter this folder"
          />
        </label>
      </nav>
    </header>
  );
}

function buildSegments(prefix: string): { label: string; prefix: string }[] {
  if (!prefix) return [];
  const parts = prefix.replace(/\/$/, "").split("/");
  const out: { label: string; prefix: string }[] = [];
  let acc = "";
  for (const part of parts) {
    acc = acc ? `${acc}${part}/` : `${part}/`;
    out.push({ label: part, prefix: acc });
  }
  return out;
}

export function ParentRow() {
  const prefix = useAppStore((s) => s.prefix);
  const setPrefix = useAppStore((s) => s.setPrefix);
  if (!prefix) return null;
  return (
    <button type="button" className={styles.parent} onClick={() => setPrefix(parentPrefix(prefix))}>
      Up one level
    </button>
  );
}
