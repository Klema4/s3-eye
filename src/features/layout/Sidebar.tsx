import { useMemo } from "react";
import { Folder, HardDrive, Plus, Settings } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import styles from "./Sidebar.module.css";
import clsx from "clsx";

export function Sidebar() {
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const prefix = useAppStore((s) => s.prefix);
  const rows = useAppStore((s) => s.rows);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);
  const setPrefix = useAppStore((s) => s.setPrefix);
  const setConnectionFormOpen = useAppStore((s) => s.setConnectionFormOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  const folderRows = useMemo(() => rows.filter((row) => row.isFolder).slice(0, 16), [rows]);
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden>
          <HardDrive size={14} strokeWidth={1.75} />
        </span>
        <span>s3-eye</span>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span>Connections</span>
          <button type="button" className={styles.iconBtn} aria-label="Add connection" onClick={() => setConnectionFormOpen(true)}>
            <Plus size={14} />
          </button>
        </div>
        <ul className={styles.list}>
          {profiles.map((profile) => (
            <li key={profile.id}>
              <button
                type="button"
                className={clsx(styles.navItem, profile.id === activeProfileId && styles.active)}
                onClick={() => setActiveProfile(profile.id)}
              >
                <span className={styles.dot} data-on={profile.id === activeProfileId ? "true" : "false"} />
                <span className={styles.navLabel}>{profile.name}</span>
              </button>
            </li>
          ))}
          {profiles.length === 0 && <li className={styles.empty}>No connections</li>}
        </ul>
      </section>

      {activeProfile && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <span>Folders</span>
          </div>
          <button
            type="button"
            className={clsx(styles.navItem, prefix === "" && styles.active)}
            onClick={() => setPrefix("")}
          >
            <Folder size={14} strokeWidth={1.75} />
            <span className={styles.navLabel}>{activeProfile.bucket}</span>
          </button>
          <ul className={styles.list}>
            {folderRows.map((folder) => (
              <li key={folder.key}>
                <button
                  type="button"
                  className={clsx(styles.navItem, styles.nested, prefix === folder.key && styles.active)}
                  onClick={() => setPrefix(folder.key)}
                >
                  <Folder size={14} strokeWidth={1.75} />
                  <span className={styles.navLabel}>{folder.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.footer}>
        <button type="button" className={styles.navItem} onClick={() => setSettingsOpen(true)}>
          <Settings size={14} strokeWidth={1.75} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
