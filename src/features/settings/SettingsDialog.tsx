import { ask } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "../../store/appStore";
import { Profile } from "../../lib/tauri";
import { Modal } from "../../design/Modal";
import { Button } from "../../design/Button";
import styles from "./SettingsDialog.module.css";

function providerLabel(preset: string) {
  if (preset === "b2") return "Backblaze B2";
  return "S3 compatible";
}

export function SettingsDialog() {
  const open = useAppStore((s) => s.settingsOpen);
  const setOpen = useAppStore((s) => s.setSettingsOpen);
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);
  const deleteProfile = useAppStore((s) => s.deleteProfile);
  const setConnectionFormOpen = useAppStore((s) => s.setConnectionFormOpen);

  const openConnection = (profile: Profile) => {
    setActiveProfile(profile.id);
    setOpen(false);
  };

  const removeConnection = async (profile: Profile) => {
    const confirmed = await ask(`Remove "${profile.name}"?`, {
      title: "Remove connection",
      kind: "warning",
    });
    if (!confirmed) return;
    await deleteProfile(profile.id);
  };

  return (
    <Modal open={open} title="Settings" onClose={() => setOpen(false)} width={560}>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h3>Connections</h3>
          <Button
            variant="primary"
            onClick={() => {
              setOpen(false);
              setConnectionFormOpen(true);
            }}
          >
            Add connection
          </Button>
        </div>

        {profiles.length === 0 ? (
          <p className={styles.empty}>No connections yet.</p>
        ) : (
          <ul className={styles.list}>
            {profiles.map((profile) => (
              <li key={profile.id} className={styles.row}>
                <div className={styles.identity}>
                  <span className={styles.name}>{profile.name}</span>
                  <span className={styles.meta}>
                    <span>{providerLabel(profile.preset)}</span>
                    <span>{profile.bucket}</span>
                    <span>{profile.region}</span>
                  </span>
                </div>
                <div className={styles.actions}>
                  {profile.id === activeProfileId ? (
                    <span className={styles.current}>Current</span>
                  ) : (
                    <Button onClick={() => openConnection(profile)}>Open</Button>
                  )}
                  <Button variant="danger" onClick={() => void removeConnection(profile)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className={styles.note}>Credentials stay in the system keychain.</p>
    </Modal>
  );
}
