import { E as ENV } from "./router-qdPwl0jo.js";
function resolveMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${ENV.STORAGE_BASE_URL.replace(/\/storage$/, "")}${path}`;
  return `${ENV.STORAGE_BASE_URL}/${path.replace(/^\//, "")}`;
}
export {
  resolveMediaUrl as r
};
