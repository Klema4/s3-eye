import { useCallback, useEffect, useState } from "react";
import { open, save, ask } from "@tauri-apps/plugin-dialog";
import { Sidebar } from "../features/layout/Sidebar";
import { TopBar } from "../features/layout/TopBar";
import { FileTable } from "../features/browser/FileTable";
import { EmptyState } from "../features/browser/EmptyState";
import { InspectorPanel } from "../features/inspector/InspectorPanel";
import { ConnectionFormModal } from "../features/profiles/ConnectionFormModal";
import { SettingsDialog } from "../features/settings/SettingsDialog";
import { CommandPalette } from "../features/command/CommandPalette";
import { ToastStack } from "../design/ToastStack";
import { Modal } from "../design/Modal";
import { Button } from "../design/Button";
import { Field, Input } from "../design/Input";
import { useAppStore } from "../store/appStore";
import { api } from "../lib/tauri";
import styles from "./AppShell.module.css";

export function AppShell() {
  const loadProfiles = useAppStore((s) => s.loadProfiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const prefix = useAppStore((s) => s.prefix);
  const selectedKey = useAppStore((s) => s.selectedKey);
  const refreshListing = useAppStore((s) => s.refreshListing);
  const pushToast = useAppStore((s) => s.pushToast);
  const pushActivity = useAppStore((s) => s.pushActivity);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const handleDelete = useCallback(async (key?: string) => {
    const target = key ?? selectedKey;
    if (!activeProfileId || !target) return;
    const ok = await ask(`Delete "${target}"?`, { title: "Delete object", kind: "warning" });
    if (!ok) return;
    try {
      await api.objectDelete(activeProfileId, target);
      pushToast("Object deleted", "success");
      pushActivity(`Deleted ${target}`, "success");
      await refreshListing();
    } catch (e) {
      pushToast(String(e), "error");
    }
  }, [activeProfileId, selectedKey, pushActivity, pushToast, refreshListing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === "F5") {
        e.preventDefault();
        void refreshListing();
      }
      if (e.key === "Delete" && selectedKey) {
        void handleDelete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDelete, refreshListing, selectedKey]);

  const handleUpload = useCallback(async () => {
    if (!activeProfileId) return;
    const picked = await open({ multiple: false, directory: false });
    if (!picked || Array.isArray(picked)) return;
    const fileName = picked.split(/[/\\]/).pop() ?? "upload";
    const key = `${prefix}${fileName}`;
    try {
      await api.objectUpload(activeProfileId, key, picked);
      pushToast(`Upload complete: ${fileName}`, "success");
      pushActivity(`Uploaded ${key}`, "success");
      await refreshListing();
    } catch (e) {
      pushToast(String(e), "error");
      pushActivity(`Upload failed for ${fileName}`, "error");
    }
  }, [activeProfileId, prefix, pushActivity, pushToast, refreshListing]);

  const handleDownload = useCallback(async (key?: string) => {
    const target = key ?? selectedKey;
    if (!activeProfileId || !target) return;
    const fileName = target.split("/").pop() ?? "download";
    const dest = await save({ defaultPath: fileName });
    if (!dest) return;
    try {
      await api.objectDownload(activeProfileId, target, dest);
      pushToast(`Download complete: ${fileName}`, "success");
      pushActivity(`Downloaded ${target}`, "success");
    } catch (e) {
      pushToast(String(e), "error");
    }
  }, [activeProfileId, selectedKey, pushActivity, pushToast]);

  const handleNewFolder = useCallback(async () => {
    if (!activeProfileId) return;
    setFolderName("");
    setFolderModalOpen(true);
  }, [activeProfileId]);

  const confirmNewFolder = async () => {
    if (!activeProfileId || !folderName.trim()) return;
    const folderPrefix = `${prefix}${folderName.trim().replace(/\/+$/, "")}/`;
    try {
      await api.objectCreateFolder(activeProfileId, folderPrefix);
      pushToast(`Folder created: ${folderName}`, "success");
      setFolderModalOpen(false);
      await refreshListing();
    } catch (e) {
      pushToast(String(e), "error");
    }
  };

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <TopBar
          onUpload={() => void handleUpload()}
          onDelete={() => void handleDelete()}
          onNewFolder={() => void handleNewFolder()}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <div className={styles.workspace}>
          <div className={styles.content}>
            {!activeProfileId ? (
              <EmptyState />
            ) : (
              <FileTable onDownload={(key) => void handleDownload(key)} onDelete={(key) => void handleDelete(key)} />
            )}
          </div>
          <InspectorPanel />
        </div>
      </div>

      <ConnectionFormModal />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onUpload={() => void handleUpload()} />
      <ToastStack />

      <SettingsDialog />

      <Modal open={folderModalOpen} title="New folder" onClose={() => setFolderModalOpen(false)}>
        <Field label="Folder name">
          <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} autoFocus />
        </Field>
        <div className="form-footer">
          <Button variant="ghost" onClick={() => setFolderModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void confirmNewFolder()}>
            Create folder
          </Button>
        </div>
      </Modal>
    </div>
  );
}
