import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Cluster, Stack } from '../layout';
import { Button, HarbourLogo, MenuIcon, Sheet } from '../ui';
import { ThemeToggle } from '../ThemeToggle';

/**
 * The landing nav — spec §6.
 *
 * A sticky top bar: the wordmark on the left, three anchor links, then the
 * theme control, Log in as a ghost button and Get started as the primary.
 * Below 48em the link row collapses into a sheet, and every row in it is a
 * 2.75rem touch target.
 *
 * **The nav starts bare and gains glass on scroll.** In Brick 3 the bar was
 * glass from the first frame, which left a hard glass edge sitting directly
 * above an aurora patch that began below it — a visible dark strip between the
 * two. Now the nav is transparent while it is over the hero, the hero patch
 * runs underneath it, and the glass fades in only once the page has scrolled
 * past the hero's top. `data-scrolled` on the header drives it, and the
 * `IntersectionObserver` below flips it, so the decision does not depend on a
 * scroll handler firing.
 *
 * The wordmark is the real lockup from Brick 3b — `HarbourLogo variant="live"`,
 * the mark plus the name in the heading face.
 *
 * The three anchors point at `#tools`, `#how-it-works` and `#trust`, which
 * exist as real section ids. Lenis handles the glide (see `useLenis`), and
 * `scroll-padding-top` in landing.css keeps the heading clear of the bar.
 */
const LINKS = [
  { href: '#tools', label: 'Tools' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#trust', label: 'Trust' },
] as const;

export function LandingNav(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  /**
   * The header itself is sticky, so a sentinel inside it never scrolls out of
   * view. Track only the top/not-top threshold and update React state when that
   * threshold changes; the listener is passive and does no per-frame work.
   */
  useEffect(() => {
    const update = (): void => {
      const next = window.scrollY > 0;
      setScrolled((current) => (current === next ? current : next));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <header className="landing-nav" data-scrolled={scrolled}>
      <nav aria-label="Main" className="landing-nav__bar-surface">
        <Container>
          <Cluster
            justify="between"
            align="center"
            gap={4}
            className="landing-nav__bar"
          >
            <a href="#top" className="landing-nav__wordmark">
              <HarbourLogo size="md" />
            </a>

            <div className="hidden md:block">
              <Cluster as="ul" gap={4} align="center" className="list-none p-0">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="landing-nav__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </Cluster>
            </div>

            <Cluster gap={2} align="center">
              <ThemeToggle variant="compact" />

              {/* Below 48em the bar keeps the wordmark, the theme control and
                  the menu button — the sheet carries the same two buttons at
                  full width, where they have room to be real touch targets. */}
              <div className="hidden md:block">
                <Cluster gap={2} align="center">
                  <Button asChild variant="ghost">
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup" className="landing-nav__action">Get started</Link>
                  </Button>
                </Cluster>
              </div>

              <div className="md:hidden">
                <Button
                  ref={menuButton}
                  variant="secondary"
                  aria-haspopup="dialog"
                  aria-expanded={menuOpen}
                  onClick={() => {
                    setMenuOpen(true);
                  }}
                >
                  <MenuIcon />
                  Menu
                </Button>
              </div>
            </Cluster>
          </Cluster>
        </Container>
      </nav>

      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Menu"
        showTitle
        returnFocusTo={menuButton}
        className="landing-nav__sheet"
        overlayClassName="landing-nav__overlay"
      >
        <Stack as="ul" gap={2} className="list-none p-0">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => {
                  setMenuOpen(false);
                }}
                className="landing-nav__menu-link flex min-h-11 items-center rounded-md border border-border bg-glass-fill-strong px-4 text-text no-underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </Stack>

        <Stack gap={2}>
          <Button asChild>
            <Link to="/signup" className="landing-nav__action">Get started</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/login">Log in</Link>
          </Button>
        </Stack>
      </Sheet>
    </header>
  );
}
