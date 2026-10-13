import { createContext, useContext } from 'react';

/**
 * The app shell's theme **reader**.
 *
 * The ported `Shell.jsx` carried its own `darkMode` state keyed on
 * `harbour-theme`. Two sources of truth for the theme is exactly the clash the
 * compat layer exists to avoid, so the shell now only *reads*: `data-theme` on
 * <html> is the single switch and the v2 `ThemeToggle` is the only control.
 *
 * This context gives the ported legacy pages the one thing they might still
 * want from the old shell — a way to know whether Harbour is dark — without any
 * of them holding state.
 *
 * The context object lives here, apart from the provider, because a module that
 * exports both a component and a constant breaks fast refresh: every edit to
 * the provider would remount the subtree instead of re-rendering it.
 */
export type ShellTheme = {
  dark: boolean;
};

export const ShellThemeContext = createContext<ShellTheme>({ dark: true });

export function useShellTheme(): ShellTheme {
  return useContext(ShellThemeContext);
}
