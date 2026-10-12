import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Brick 3 end-to-end gate — spec §12.
 *
 * For `/`, in both themes, at 320 / 360 / 390 / 768 / 1024 / 1440:
 *   - take a screenshot at 360 and 1440,
 *   - fail if the document scrolls horizontally,
 *   - fail on any serious or critical axe violation.
 *
 * Plus the things this brick is actually about:
 *   - the skip link, the landmarks and the single h1,
 *   - a keyboard-only pass through the nav, the hero CTAs and the mobile sheet,
 *   - both call-to-action states (the returning one lives in /dev/components,
 *     because there is no profile store to put it on `/` yet),
 *   - the WaveLine settling, and pausing when it leaves the viewport,
 *   - the reduced-motion pass, where the line is static from the first frame.
 */

const LANDING_PATH = '/';
const COMPONENTS_PATH = '/dev/components';
const THEMES = ['dark', 'light'] as const;
const WIDTHS = [320, 360, 390, 768, 1024, 1440] as const;
const VIEWPORT_HEIGHT = 900;

// Kept out of Playwright's outputDir so the screenshots survive a re-run.
// Gitignored.
const SCREENSHOT_DIR = 'screenshots';

type Theme = (typeof THEMES)[number];

async function openLanding(
  page: Page,
  theme: Theme,
  width: number,
): Promise<void> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.addInitScript((mode) => {
    window.localStorage.setItem('harbour:theme', mode);
  }, theme);
  await page.goto(LANDING_PATH);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Your safe harbour in Hong Kong.',
    }),
  ).toBeVisible();
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

const SCREENSHOT_WIDTHS = new Set([360, 1440]);

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    test(`landing · ${theme} · ${width}px`, async ({ page }) => {
      await openLanding(page, theme, width);

      await expectNoHorizontalOverflow(page);

      if (SCREENSHOT_WIDTHS.has(width)) {
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/landing-${theme}-${width}.png`,
          fullPage: true,
        });
      }

      await expectNoSeriousAxeViolations(page);
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Structure                                                                   */
/* -------------------------------------------------------------------------- */

test('landing: one h1, named landmarks, and a skip link that moves focus', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  expect(await page.getByRole('heading', { level: 1 }).count()).toBe(1);

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();

  // The safety rail is a second nav, so it must have its own name — a duplicate
  // landmark name is what axe's `landmark-unique` flags.
  await expect(
    page.getByRole('navigation', { name: 'Emergency and support numbers' }),
  ).toBeVisible();

  // The skip link is first in the tab order and takes focus to <main>.
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('landing: the nav is a sticky glass bar above 48em', async ({ page }) => {
  await openLanding(page, 'dark', 1024);

  // The stickiness is on the <header>, not on the <nav>: a sticky element only
  // sticks within its parent, and the header is what spans the page. The glass
  // is on the nav, which is the surface that meets the viewport edges.
  const header = page.locator('.landing-nav');
  const position = await header.evaluate(
    (el) => getComputedStyle(el).position,
  );
  expect(position).toBe('sticky');

  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav).toHaveClass(/glass/);
  await expect(nav).toHaveClass(/glass--bar/);

  // Above 48em the link row is visible and the sheet trigger is not.
  await expect(page.getByRole('link', { name: 'Tools' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
});

test('landing: below 48em the links move into a sheet of 2.75rem rows', async ({
  page,
}) => {
  await openLanding(page, 'dark', 390);

  await expect(page.getByRole('link', { name: 'Tools' })).toBeHidden();

  const trigger = page.getByRole('button', { name: 'Menu' });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const sheet = page.getByRole('dialog');
  await expect(sheet).toBeVisible();

  const row = sheet.getByRole('link', { name: 'Tools' });
  await expect(row).toBeVisible();
  const box = await row.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);

  // Escape closes it and hands focus back to the trigger.
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('landing: the whole page is reachable from the keyboard alone', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  // Tab from the top and collect the names of everything focusable in the
  // header and the hero, in order.
  const reached: string[] = [];
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return '';
      return (
        el.getAttribute('aria-label') ??
        el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 40) ??
        ''
      );
    });
    reached.push(label);
  }

  expect(reached).toContain('Tools');
  expect(reached).toContain('How it works');
  expect(reached).toContain('Trust');
  expect(reached).toContain('Log in');
  expect(reached).toContain('Get started');
  expect(reached).toContain('Create your profile');
  expect(reached).toContain('See how it works');
});

/* -------------------------------------------------------------------------- */
/* Both call-to-action states                                                  */
/* -------------------------------------------------------------------------- */

test('landing: a new visitor gets the create-your-profile call to action', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  // `useSavedProfile` returns null until Brick 6, so this is the state `/` is in.
  const cta = page.locator('[data-state="new"]');
  await expect(cta).toBeVisible();
  await expect(cta.getByRole('link', { name: 'Create your profile' })).toHaveAttribute(
    'href',
    '/signup',
  );
  await expect(cta.getByRole('link', { name: 'See how it works' })).toBeVisible();

  await expect(page.locator('[data-state="returning"]')).toHaveCount(0);
});

test('components: the returning call to action, with a saved nickname', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: VIEWPORT_HEIGHT });
  await page.goto(COMPONENTS_PATH);

  const returning = page.locator('[data-state="returning"]');
  await expect(returning).toBeVisible();
  await expect(
    returning.getByRole('link', { name: 'Continue as Mei' }),
  ).toHaveAttribute('href', '/app');
  await expect(
    returning.getByRole('link', { name: 'Not you? Choose a profile' }),
  ).toHaveAttribute('href', '/login');
});

/* -------------------------------------------------------------------------- */
/* Scene A — the wave line                                                     */
/* -------------------------------------------------------------------------- */

/** The amplitude the ticker last wrote, which is what the path is drawn from. */
async function readAmplitude(page: Page): Promise<number> {
  const raw = await page.locator('.wave-line').getAttribute('data-amplitude');
  return Number.parseFloat(raw ?? 'NaN');
}

/**
 * The wave sits at the foot of the hero, which is taller than a 900px viewport,
 * so it starts offscreen — which is exactly why the settle is tied to the first
 * scroll-in rather than to mount.
 */
async function bringWaveIntoView(page: Page): Promise<void> {
  await page.locator('.wave-line').scrollIntoViewIfNeeded();
}

test('wave line: settles once on first scroll-in, then holds at 0.06', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  const line = page.locator('.wave-line');
  await expect(line).toBeVisible();
  await expect(line).toHaveAttribute('data-paused', 'true');

  // The settle starts when the line first enters the viewport, not before.
  await bringWaveIntoView(page);
  await expect.poll(() => readAmplitude(page), { timeout: 5000 }).toBe(0.06);

  // And it never loops: the amplitude holds, and so does the path.
  await page.waitForTimeout(1500);
  expect(await readAmplitude(page)).toBe(0.06);

  const d = await line.locator('.wave-line__line').getAttribute('d');
  // 96 points, and `A` is the only thing that moves: the path changes with the
  // amplitude and stops changing once the settle is over.
  expect(d?.match(/[ML]/g)?.length).toBe(96);

  await page.waitForTimeout(400);
  expect(await line.locator('.wave-line__line').getAttribute('d')).toBe(d);
});

test('wave line: the ticker pauses when the line leaves the viewport', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  const line = page.locator('.wave-line');

  await bringWaveIntoView(page);
  await expect(line).toHaveAttribute('data-paused', 'false');

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await expect(line).toHaveAttribute('data-paused', 'true');

  await bringWaveIntoView(page);
  await expect(line).toHaveAttribute('data-paused', 'false');
});

test('wave line: reduced motion renders the calm state with no animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page, 'dark', 1024);

  const line = page.locator('.wave-line');
  await expect(line).toHaveAttribute('data-reduced-motion', 'true');
  await expect(line).toHaveAttribute('data-amplitude', '0.060');

  const d = await line.locator('.wave-line__line').getAttribute('d');
  await page.waitForTimeout(900);
  expect(await line.locator('.wave-line__line').getAttribute('d')).toBe(d);

  await expectNoHorizontalOverflow(page);
  await expectNoSeriousAxeViolations(page);
});

test('landing · reduced motion · dark · 768px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page, 'dark', 768);

  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/landing-dark-768-reduced-motion.png`,
    fullPage: true,
  });
  await expectNoSeriousAxeViolations(page);
});

/* -------------------------------------------------------------------------- */
/* The art slot                                                                */
/* -------------------------------------------------------------------------- */

test('art slot: empty, it is a marked placeholder rather than a blank box', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  const slot = page.locator('.art-slot');
  await expect(slot).toHaveAttribute('data-empty', 'true');
  await expect(slot).toContainText('Art slot');
  await expect(slot.locator('img')).toHaveCount(0);
});

/* -------------------------------------------------------------------------- */
/* Zoom and text size                                                          */
/* -------------------------------------------------------------------------- */

test.describe('200% zoom (emulated: CSS viewport halved)', () => {
  for (const theme of THEMES) {
    for (const width of [1024, 1440]) {
      test(`landing · ${theme} · ${width}px window @ 200%`, async ({ page }) => {
        await openLanding(page, theme, width / 2);

        await expectNoHorizontalOverflow(page);
        await expectNoSeriousAxeViolations(page);
      });
    }
  }
});

test.describe('200% text size (root font-size doubled)', () => {
  for (const theme of THEMES) {
    test(`landing · ${theme} · 1024px @ 200% text size`, async ({ page }) => {
      await openLanding(page, theme, 1024);
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });

      await expectNoHorizontalOverflow(page);
      await expectNoSeriousAxeViolations(page);
    });
  }
});
