import { useEffect, useState } from 'react';
import { readLegacyProfile, type LegacyProfile } from './profile-store';

/**
 * The saved profile, as the landing page needs it.
 *
 * Brick 3 returned a hard `null`. It now reads the real store — the same
 * legacy key the ported app lane reads — and re-reads it whenever anything on
 * the page changes it (`harbour-profile-change`) or another tab does
 * (`storage`). That means the landing page's call to action flips from
 * "Get started" to "Continue as {name}" the moment signup finishes, without a
 * reload.
 *
 * It stays a hook so that both the landing page and `/dev/components` can read
 * the same shape, and so a component that only wants the nickname does not have
 * to know about the storage layout.
 */
export type SavedProfile = LegacyProfile;

export function useSavedProfile(): SavedProfile | null {
  const [profile, setProfile] = useState<SavedProfile | null>(() =>
    readLegacyProfile(),
  );

  useEffect(() => {
    const sync = (): void => setProfile(readLegacyProfile());
    window.addEventListener('harbour-profile-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('harbour-profile-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return profile;
}
