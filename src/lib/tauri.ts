import { invoke } from "@tauri-apps/api/core";

export interface Profile {
  id: string;
  name: string;
  preset: string;
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
}

export interface ProfileInput {
  id?: string;
  name: string;
  preset: string;
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey?: string;
}

export interface S3ObjectRow {
  key: string;
  name: string;
  size: number;
  lastModified?: string | null;
  isFolder: boolean;
  contentType?: string | null;
}

export interface ListPage {
  parentPrefix: string;
  rows: S3ObjectRow[];
  nextContinuationToken?: string | null;
  isTruncated: boolean;
}

export interface HeadResult {
  key: string;
  size: number;
  etag?: string | null;
  contentType?: string | null;
  storageClass?: string | null;
  lastModified?: string | null;
  metadata: Record<string, string>;
}

export interface PreviewResult {
  mime?: string | null;
  text?: string | null;
  base64?: string | null;
  tooLarge: boolean;
}

export const api = {
  profileList: () => invoke<Profile[]>("profile_list"),
  profileSave: (input: ProfileInput) => invoke<Profile>("profile_save", { input }),
  profileDelete: (profileId: string) => invoke<void>("profile_delete", { profileId }),
  profileTestConnection: (profileId: string) =>
    invoke<void>("profile_test_connection", { profileId }),
  objectList: (profileId: string, prefix: string, continuationToken?: string | null) =>
    invoke<ListPage>("object_list", {
      profileId,
      prefix,
      continuationToken: continuationToken ?? null,
    }),
  objectHead: (profileId: string, key: string) =>
    invoke<HeadResult>("object_head", { profileId, key }),
  objectDownload: (profileId: string, key: string, destPath: string) =>
    invoke<void>("object_download", { profileId, key, destPath }),
  objectUpload: (profileId: string, key: string, localPath: string) =>
    invoke<void>("object_upload", { profileId, key, localPath }),
  objectDelete: (profileId: string, key: string) =>
    invoke<void>("object_delete", { profileId, key }),
  objectCreateFolder: (profileId: string, prefix: string) =>
    invoke<void>("object_create_folder", { profileId, prefix }),
  previewPrepare: (profileId: string, key: string) =>
    invoke<PreviewResult>("preview_prepare", { profileId, key }),
  b2DefaultEndpoint: (region: string) =>
    invoke<string>("b2_default_endpoint", { region }),
};
