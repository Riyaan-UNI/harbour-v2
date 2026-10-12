import { Link } from 'react-router-dom';
import { Cluster } from '../layout';
import { Button } from '../ui';

/**
 * The hero's call to action, in both of its states.
 *
 * A new visitor gets "Create your profile" and "See how it works". A visitor
 * with a saved profile gets "Continue as <nickname>" and a way out — "Not you?
 * Choose a profile" — because the landing page should not assume which of two
 * people at the same browser is reading it. Addendum 1 §4 asks for both.
 *
 * `savedNickname` is a prop rather than a hook call so both states can be shown
 * side by side in `/dev/components` without a profile store to fake. The
 * landing passes whatever `useSavedProfile` returns, which is `null` until
 * Brick 6.
 */
export type HeroCtaProps = {
  /** The active profile's nickname. `null` or undefined for a new visitor. */
  savedNickname?: string | null;
  className?: string;
};

export function HeroCta({
  savedNickname,
  className,
}: HeroCtaProps): JSX.Element {
  const nickname = savedNickname?.trim();

  if (nickname) {
    return (
      <Cluster gap={3} className={className} data-state="returning">
        <Button asChild size="large">
          <Link to="/app">Continue as {nickname}</Link>
        </Button>
        <Button asChild variant="ghost" size="large">
          <Link to="/login">Not you? Choose a profile</Link>
        </Button>
      </Cluster>
    );
  }

  return (
    <Cluster gap={3} className={className} data-state="new">
      <Button asChild size="large">
        <Link to="/signup">Create your profile</Link>
      </Button>
      <Button asChild variant="ghost" size="large">
        <a href="#how-it-works">See how it works</a>
      </Button>
    </Cluster>
  );
}
