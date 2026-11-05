export const EMPTY_VALUE = "Not available";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return EMPTY_VALUE;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function parentPrefix(prefix: string): string {
  if (!prefix) return "";
  const trimmed = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const idx = trimmed.lastIndexOf("/");
  if (idx === -1) return "";
  return `${trimmed.slice(0, idx + 1)}`;
}

export function joinPrefix(prefix: string, segment: string): string {
  const base = prefix.endsWith("/") || !prefix ? prefix : `${prefix}/`;
  return `${base}${segment}${segment.endsWith("/") ? "" : "/"}`;
}
