/**
 * Module declarations for the ported legacy lane.
 *
 * `src/legacy/**` is plain JSX carried over from the old build. It is excluded
 * from the TypeScript project (see `exclude` in tsconfig.json) because it
 * predates this repo's strict rules, and Vite compiles it without ever asking
 * TypeScript about it.
 *
 * A `.tsx` file still has to *import* from it, and a relative specifier would
 * send tsc looking for a file it has been told to ignore. So the two lanes meet
 * at a path alias instead: `@legacy/...` resolves to the real file for Vite,
 * and to the ambient declarations below for tsc. That is the whole trick — the
 * specifier tsc sees never points at an excluded file.
 *
 * The declarations are deliberately loose. What matters is that the specifier
 * resolves and the *named* exports a `.tsx` file actually reaches for exist, so
 * a typo is caught at typecheck time rather than at runtime. Components are
 * untyped on purpose: the point of excluding those files is that they are not
 * type-checked.
 */

/** Legacy pages — every one is a default-exported component. */
declare module '@legacy/pages/*' {
  const Component: (props: Record<string, unknown>) => JSX.Element;
  export default Component;
}

/** Legacy components — default-exported, except the named ones below. */
declare module '@legacy/components/*' {
  const Component: (props: Record<string, unknown>) => JSX.Element;
  export default Component;

  /** The legacy icon set: one component, a `name` union and a px `size`. */
  export function Icon(props: {
    name: string;
    size?: number;
    className?: string;
    style?: Record<string, string>;
  }): JSX.Element;

  /** The legacy toast host, mounted once by the shell. */
  export function ToastHost(): JSX.Element;
}

/** Legacy hooks — the shell's navigation helper. */
declare module '@legacy/hooks/useViewTransitionNavigate.js' {
  export function useViewTransitionNavigate(): (to: string) => void;
}

/**
 * The legacy `ProfileContext` is the one legacy module a `.tsx` file takes
 * *named* exports from outside the component stubs, so it gets a real shape.
 * Everything here mirrors the JSX file it declares.
 */
declare module '@legacy/context/ProfileContext.jsx' {
  import type { ReactNode } from 'react';

  export type LegacyProfileShape = {
    name: string;
    country: string;
    university: string;
    socials: Record<string, string>;
    avatar?: string;
    photo?: string;
    id?: string;
    createdAt?: string;
    mascotId?: string;
    tourDone?: boolean;
  };

  export function ProfileProvider(props: { children: ReactNode }): JSX.Element;

  export function useProfile(): {
    profile: LegacyProfileShape | null;
    profiles: LegacyProfileShape[];
    saveProfile: (value: LegacyProfileShape) => boolean;
    selectProfile: (id: string) => boolean;
    clearProfile: () => void;
    removeProfile: (id: string) => void;
  };
}

/**
 * The legacy API transport.
 */
declare module '@legacy/lib/api.js' {
  export function translateText(text: string): Promise<{ translation?: string }>;
  export function sendChat(
    message: string,
    history?: Array<{ role: 'user' | 'harbour'; content: string }>,
  ): Promise<{ reply: string; demo?: boolean }>;
}

/** The offline Cantonese phrase pack — draft wording, review before release. */
declare module '@legacy/data/essentialCantonesePhrases.js' {
  export type EssentialCantonesePhrase = {
    category: string;
    english: string;
    cantonese: string;
    jyutping: string;
  };
  export const essentialCantonesePhrases: readonly EssentialCantonesePhrase[];
}
