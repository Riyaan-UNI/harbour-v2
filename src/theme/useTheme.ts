import { useSyncExternalStore } from 'react';
import {
  getMode,
  subscribe,
  THEME_CHANGE_EVENT,
  type ResolvedTheme,
  type ThemeMode,
} from './theme';

/** The user's chosen mode: `system`, `light` or `dark`. */
export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, getMode, getMode);
}

function subscribeToResolved(listener: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, listener);
  };
}

function getResolvedSnapshot(): ResolvedTheme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

/** The theme actually in effect once `system` has been resolved. */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(
    subscribeToResolved,
    getResolvedSnapshot,
    () => 'dark',
  );
}
