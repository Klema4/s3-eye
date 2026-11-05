import { create } from "zustand";
import {
  api,
  HeadResult,
  ListPage,
  PreviewResult,
  Profile,
  ProfileInput,
  S3ObjectRow,
} from "../lib/tauri";

export type ActivityStatus = "success" | "error" | "info";

export interface ActivityItem {
  id: string;
  label: string;
  status: ActivityStatus;
  at: number;
}

export interface ToastItem {
  id: string;
  message: string;
  status: ActivityStatus;
}

interface AppState {
  profiles: Profile[];
  activeProfileId: string | null;
  prefix: string;
  rows: S3ObjectRow[];
  nextToken: string | null;
  isTruncated: boolean;
  selectedKey: string | null;
  inspectorOpen: boolean;
  head: HeadResult | null;
  preview: PreviewResult | null;
  search: string;
  loading: boolean;
  settingsOpen: boolean;
  connectionFormOpen: boolean;
  toasts: ToastItem[];
  activities: ActivityItem[];
  loadProfiles: () => Promise<void>;
  setActiveProfile: (id: string | null) => void;
  setPrefix: (prefix: string) => void;
  refreshListing: (append?: boolean) => Promise<void>;
  selectRow: (row: S3ObjectRow | null) => Promise<void>;
  setSearch: (q: string) => void;
  toggleInspector: (open?: boolean) => void;
  saveProfile: (input: ProfileInput) => Promise<Profile>;
  deleteProfile: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<void>;
  pushToast: (message: string, status?: ActivityStatus) => void;
  dismissToast: (id: string) => void;
  pushActivity: (label: string, status?: ActivityStatus) => void;
  setSettingsOpen: (open: boolean) => void;
  setConnectionFormOpen: (open: boolean) => void;
}

const uid = () => crypto.randomUUID();

export const useAppStore = create<AppState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  prefix: "",
  rows: [],
  nextToken: null,
  isTruncated: false,
  selectedKey: null,
  inspectorOpen: true,
  head: null,
  preview: null,
  search: "",
  loading: false,
  settingsOpen: false,
  connectionFormOpen: false,
  toasts: [],
  activities: [],

  loadProfiles: async () => {
    const profiles = await api.profileList();
    set({ profiles });
    if (!get().activeProfileId && profiles.length > 0) {
      set({ activeProfileId: profiles[0].id });
    }
  },

  setActiveProfile: (id) => {
    set({
      activeProfileId: id,
      prefix: "",
      rows: [],
      selectedKey: null,
      head: null,
      preview: null,
      nextToken: null,
    });
    if (id) void get().refreshListing();
  },

  setPrefix: (prefix) => {
    set({ prefix, selectedKey: null, head: null, preview: null });
    void get().refreshListing();
  },

  refreshListing: async (append = false) => {
    const { activeProfileId, prefix, nextToken } = get();
    if (!activeProfileId) return;
    set({ loading: true });
    try {
      const page: ListPage = await api.objectList(
        activeProfileId,
        prefix,
        append ? nextToken : null,
      );
      set((s) => ({
        rows: append ? [...s.rows, ...page.rows] : page.rows,
        nextToken: page.nextContinuationToken ?? null,
        isTruncated: page.isTruncated,
        loading: false,
      }));
    } catch (e) {
      set({ loading: false });
      get().pushToast(String(e), "error");
    }
  },

  selectRow: async (row) => {
    if (!row || row.isFolder) {
      set({ selectedKey: null, head: null, preview: null });
      return;
    }
    const { activeProfileId } = get();
    if (!activeProfileId) return;
    set({ selectedKey: row.key, inspectorOpen: true });
    try {
      const [head, preview] = await Promise.all([
        api.objectHead(activeProfileId, row.key),
        api.previewPrepare(activeProfileId, row.key),
      ]);
      set({ head, preview });
    } catch (e) {
      get().pushToast(String(e), "error");
    }
  },

  setSearch: (q) => set({ search: q }),

  toggleInspector: (open) =>
    set((s) => ({ inspectorOpen: open ?? !s.inspectorOpen })),

  saveProfile: async (input) => {
    const profile = await api.profileSave(input);
    await get().loadProfiles();
    set({ activeProfileId: profile.id, connectionFormOpen: false });
    get().pushActivity(`Saved connection ${profile.name}`, "success");
    return profile;
  },

  deleteProfile: async (id) => {
    await api.profileDelete(id);
    await get().loadProfiles();
    if (get().activeProfileId === id) {
      set({ activeProfileId: null, rows: [] });
    }
  },

  testConnection: async (id) => {
    await api.profileTestConnection(id);
    get().pushToast("Connection verified", "success");
    get().pushActivity("Connection verified", "success");
  },

  pushToast: (message, status = "info") => {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { id, message, status }] }));
    setTimeout(() => get().dismissToast(id), 4000);
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  pushActivity: (label, status = "info") =>
    set((s) => ({
      activities: [{ id: uid(), label, status, at: Date.now() }, ...s.activities].slice(
        0,
        10,
      ),
    })),

  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setConnectionFormOpen: (open) => set({ connectionFormOpen: open }),
}));
