/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to a truthy string to expose /dev/gallery outside `vite dev`. */
  readonly VITE_ENABLE_GALLERY?: string;
}
