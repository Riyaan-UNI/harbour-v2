import { Aurora } from '../components/Aurora';
import { LandingFooter, LandingNav, Hero } from '../components/landing';
import { useLenis } from '../lib/useLenis';
import { useSavedProfile } from '../lib/useSavedProfile';

/**
 * The landing page — Brick 3 builds the top of it.
 *
 * What is here: the skip link, the sticky glass nav, the hero with the WaveLine
 * and the art slot, and the footer. What is not, and is Brick 4: the four
 * tools, the problem cards, the live demo, how it works, the preview strip and
 * the trust band. The nav's three anchors already point at the ids Brick 4 will
 * create.
 *
 * One `h1`, on the hero headline. The nav and the footer carry no headings —
 * their landmarks are named with `aria-label` instead — so the outline is a
 * single top-level heading and nothing else.
 */
export function Landing(): JSX.Element {
  const profile = useSavedProfile();
  useLenis();

  return (
    <>
      <Aurora />

      <a href="#main" className="landing-skip">
        Skip to content
      </a>

      <div className="layer-raised">
        <LandingNav />

        <main id="main" tabIndex={-1}>
          <Hero savedNickname={profile?.nickname ?? null} />
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
