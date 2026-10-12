import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Cluster, Stack } from '../layout';
import { Button, HarbourLogo, MenuIcon, Sheet } from '../ui';

/**
 * The landing nav — spec §6.
 *
 * A sticky glass top bar: the wordmark on the left, three anchor links, then
 * Log in as a ghost button and Get started as the primary. Below 48em the link
 * row collapses into a sheet, and every row in it is a 2.75rem touch target.
 *
 * The wordmark is the real lockup from Brick 3b — `HarbourLogo variant="live"`,
 * the mark plus the name in the heading face. Brick 3 set the name as text on
 * its own because the supplied lockup was a light-background asset with a serif
 * wordmark; now that the mark is token-mapped and the name is live text, both
 * halves work in both themes.
 *
 * The three anchors point at `#tools`, `#how-it-works` and `#trust`, which
 * Brick 4 creates. Until then they are honest dead ends rather than wrong ones.
 */
const LINKS = [
  { href: '#tools', label: 'Tools' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#trust', label: 'Trust' },
] as const;

export function LandingNav(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <header className="landing-nav">
      <nav aria-label="Main" className="glass glass--bar">
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
              {/* Below 48em the bar keeps the wordmark and the menu button and
                  nothing else — the sheet carries the same two buttons at full
                  width, where they have room to be real touch targets. */}
              <div className="hidden md:block">
                <Cluster gap={2} align="center">
                  <Button asChild variant="ghost">
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Get started</Link>
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
      >
        <Stack as="ul" gap={2} className="list-none p-0">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => {
                  setMenuOpen(false);
                }}
                className="flex min-h-11 items-center rounded-md border border-border bg-glass-fill-strong px-4 text-text no-underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </Stack>

        <Stack gap={2}>
          <Button asChild>
            <Link to="/signup">Get started</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/login">Log in</Link>
          </Button>
        </Stack>
      </Sheet>
    </header>
  );
}
