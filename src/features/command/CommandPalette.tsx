import { Command } from "cmdk";
import { useAppStore } from "../../store/appStore";
import styles from "./CommandPalette.module.css";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: () => void;
}

export function CommandPalette({ open, onOpenChange, onUpload }: Props) {
  const profiles = useAppStore((s) => s.profiles);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);
  const refreshListing = useAppStore((s) => s.refreshListing);
  const setConnectionFormOpen = useAppStore((s) => s.setConnectionFormOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const setPrefix = useAppStore((s) => s.setPrefix);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => onOpenChange(false)}>
      <Command className={styles.palette} label="Command palette" onClick={(e) => e.stopPropagation()}>
        <Command.Input placeholder="Search commands" autoFocus />
        <Command.List>
          <Command.Empty>No matching commands</Command.Empty>
          <Command.Group heading="Actions">
            <Command.Item
              onSelect={() => {
                onOpenChange(false);
                void refreshListing();
              }}
            >
              Refresh listing
            </Command.Item>
            <Command.Item
              onSelect={() => {
                onOpenChange(false);
                onUpload();
              }}
            >
              Upload file
            </Command.Item>
            <Command.Item
              onSelect={() => {
                onOpenChange(false);
                setConnectionFormOpen(true);
              }}
            >
              Add connection
            </Command.Item>
            <Command.Item
              onSelect={() => {
                onOpenChange(false);
                setSettingsOpen(true);
              }}
            >
              Open settings
            </Command.Item>
            <Command.Item
              onSelect={() => {
                onOpenChange(false);
                setPrefix("");
              }}
            >
              Go to bucket root
            </Command.Item>
          </Command.Group>
          {profiles.length > 0 && (
            <Command.Group heading="Connections">
              {profiles.map((p) => (
                <Command.Item
                  key={p.id}
                  onSelect={() => {
                    onOpenChange(false);
                    setActiveProfile(p.id);
                  }}
                >
                  Open connection {p.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
