import { ENV } from "@/config/environment";

/**
 * Resolve a storage-relative media path to a full URL.
 */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${ENV.STORAGE_BASE_URL.replace(/\/storage$/, "")}${path}`;
  return `${ENV.STORAGE_BASE_URL}/${path.replace(/^\//, "")}`;
}
