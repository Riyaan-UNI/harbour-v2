/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to a truthy string to expose /dev/gallery outside `vite dev`. */
  readonly VITE_ENABLE_GALLERY?: string;
  /** The backend's HTTPS origin for a deployed build. Empty in dev (Vite proxies /api). */
  readonly VITE_API_URL?: string;
}
