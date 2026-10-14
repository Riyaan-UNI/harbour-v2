import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ARRIVAL_DESTINATION, TERMINAL_LINES } from '../src/components/arrival/arrivalTransition';

/**
 * End-to-end gate for the `/arrival` passage — the story, the warp transition
 * and the handoff.
 *
 * The transition is the first place the app asks a WebGL canvas to run inside a
 * timed GSAP timeline, so this spec pins the things that are easy to break:
 *
 * - the ripple/warp overlay mounts and the terminal lines reveal,
 * - the handoff lands on `/app/home` (the destination lives in one exported
 *   constant, read here rather than re-typed),
 * - a reduced-motion visitor skips the whole passage and is handed straight to
 *   the app — no canvas, no storyline wait,
 * - nothing overflows and axe stays clean at every width.
 *
 * The `/arrival` route is gated on a device-local profile, so every test seeds
 * the legacy `harbour-profile` key the guard reads.
 */

const ENTRY_PATH = '/arrival';
const THEMES = ['dark', 'light'] as const;
const WIDTHS = [320, 390, 768, 1440] as const;
const VIEWPORT_HEIGHT = 900;

const SCREENSHOT_DIR = 'screenshots';
const SCREENSHOT_WIDTHS = new Set([390, 1440]);

type Theme = (typeof THEMES)[number];

/**
 * Seed a profile and open `/arrival`.
 *
 * `reducedMotion: true` makes the browser report the OS-level setting, which is
 * what `ArrivalStory` reads on mount.
 */
async function openArrival(
  page: Page,
  theme: Theme,
  width: number,
  reducedMotion = false,
): Promise<void> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });

  await page.addInitScript(
    ({ mode }) => {
      window.localStorage.setItem('harbour:theme', mode);
      // The entry guard reads the legacy key.
      window.localStorage.setItem(
        'harbour-profile',
        JSON.stringify({
          name: 'Sam Okonkwo',
          country: 'Ghana',
          university: 'HKU',
          socials: {},
        }),
      );
    },
    { mode: theme },
  );

  await page.goto(ENTRY_PATH);
  await expect(page).toHaveURL(new RegExp(`${ENTRY_PATH}$`));
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    scrollWidth,
    `Horizontal overflow: scrollWidth ${scrollWidth} exceeds clientWidth ${clientWidth}`,
  ).toBeLessThanOrEqual(clientWidth);
}

async function expectNoSeriousAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();

  const blocking = results.violations.filter(
    (violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
  );

  const details = blocking.flatMap((violation) =>
    violation.nodes.map((node) => {
      const reason = (node.failureSummary ?? '').replace(/\s+/g, ' ');
      return `${violation.id} [${violation.impact}] ${node.target.join(' ')} :: ${reason}`;
    }),
  );

  expect(details, 'axe reported serious or critical violations').toEqual([]);
}

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    test(`arrival story · ${theme} · ${width}px`, async ({ page }) => {
      await openArrival(page, theme, width);

      // The story renders one h1 and the skip control is reachable immediately,
      // so a visitor is never trapped behind the animated passage.
      await expect(
        page.getByRole('heading', { level: 1, name: 'Your arrival in Hong Kong' }),
      ).toBeAttached();
      await expect(
        page.getByRole('button', { name: /Skip story/ }),
      ).toBeVisible();

      await expectNoHorizontalOverflow(page);
      await expectNoSeriousAxeViolations(page);

      if (SCREENSHOT_WIDTHS.has(width)) {
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/arrival-${theme}-${width}.png`,
        });
      }
    });
  }
}

test('the warp transition settles and hands off to the app', async ({ page }) => {
  await openArrival(page, 'dark', 1440);

  // Skip the storyline to reach the settled state where "Continue" appears.
  await page.getByRole('button', { name: /Skip story/ }).click();

  const continueButton = page.getByRole('button', { name: /Continue to Harbour/ });
  await expect(continueButton).toBeVisible();
  await continueButton.click();

  // The overlay takes over: the ripple and the WebGL warp host both mount.
  await expect(page.locator('.arrival-transition')).toBeAttached();
  await expect(page.locator('.arrival-transition-ripple')).toBeAttached();
  await expect(page.locator('.fiber-warp')).toBeAttached();

  // Every configured line is present in the terminal, in order.
  const lines = page.locator('.arrival-terminal-line');
  await expect(lines).toHaveCount(TERMINAL_LINES.length);
  for (const [index, line] of TERMINAL_LINES.entries()) {
    await expect(lines.nth(index)).toHaveText(line);
  }

  // The overlay is decorative: it must not be announced by a screen reader.
  await expect(page.locator('.arrival-transition')).toHaveAttribute(
    'aria-hidden',
    'true',
  );

  // And then it lands on the real app home.
  await expect(page).toHaveURL(new RegExp(`${ARRIVAL_DESTINATION}$`), {
    timeout: 20_000,
  });
});

test('reduced motion skips the passage and goes straight to the app', async ({ page }) => {
  await openArrival(page, 'dark', 1440, true);

  // The storyline resolves immediately and the doorway is offered at once.
  const continueButton = page.getByRole('button', { name: /Continue to Harbour/ });
  await expect(continueButton).toBeVisible();

  await continueButton.click();

  // No warp, no canvas — straight to the destination.
  await expect(page.locator('.arrival-transition')).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`${ARRIVAL_DESTINATION}$`), {
    timeout: 20_000,
  });
});
