/**
 * The saved profile, as the landing page needs it.
 *
 * Brick 6 adds the real store (spec §10: `harbour:v1:profiles`, validated with
 * zod, read inside a try/catch). Until then there is genuinely nothing to read,
 * so this returns `null` and the landing shows the new-visitor call to action.
 *
 * It is a hook rather than a constant so that the one place the CTA block reads
 * from is already in the right shape, and so `/dev/components` can render both
 * states without a store to fake.
 */
export type SavedProfile = {
  nickname: string;
};

export function useSavedProfile(): SavedProfile | null {
  return null;
}
