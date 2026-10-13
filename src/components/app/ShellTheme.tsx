import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ShellThemeContext } from './shell-theme-context';

/**
 * App-shell providers.
 *
 * Three small providers that every `/app` page sits inside. They are grouped
 * because they are all "shell-level ambient state" and are always used
 * together; each is exported separately so a test can mount just the one it
 * needs.
 *
 * Theme is **read-only** here. The v2 theme module owns `data-theme`; this
 * provider mirrors it into React state through a MutationObserver, so a page
 * that branches on `useShellTheme().dark` re-renders when the engine flips the
 * theme — including when the flip comes from the ThemeToggle in the shell bar.
 */

function readDark(): boolean {
  if (typeof document === 'undefined') return true;
  return document.documentElement.dataset.theme !== 'light';
}

export function ShellThemeProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [dark, setDark] = useState(readDark);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(readDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <ShellThemeContext.Provider value={{ dark }}>
      {children}
    </ShellThemeContext.Provider>
  );
}

/**
 * Calm mode — the legacy build's reduced-decoration switch.
 *
 * The legacy shell owned both `data-theme` and `data-calm`. Theme moved to the
 * v2 engine; calm stays here, because no v2 component owns it and the ported
 * CSS still keys off `data-calm` on <html>.
 *
 * It sets the attribute on mount from storage, or from the OS setting when the
 * user has never chosen. The live toggle lives in the shell's More panel.
 */
export function CalmModeProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('harbour-calm-mode');
    } catch {
      // Storage can be unavailable; reduced motion is still readable.
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const calm = saved ? saved === 'on' : reduced;
    document.documentElement.dataset.calm = calm ? 'true' : 'false';
  }, []);

  return <>{children}</>;
}
