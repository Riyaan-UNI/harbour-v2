import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Brick 0 end-to-end gate — spec §12.
 *
 * For /dev/gallery, in both themes, at 360 / 390 / 768 / 1024 / 1440 px:
 *   - take a screenshot,
 *   - fail if the document scrolls horizontally,
 *   - fail on any serious or critical axe violation.
 *
 * Plus a reduced-motion pass and a keyboard-only pass over the theme toggle.
 */

const GALLERY_PATH = '/dev/gallery';
const THEMES = ['dark', 'light'] as const;
const WIDTHS = [360, 390, 768, 1024, 1440] as const;
const VIEWPORT_HEIGHT = 900;

// Kept out of Playwright's outputDir so the screenshots survive a re-run and are
// easy to review. Gitignored.
const SCREENSHOT_DIR = 'screenshots';

type Theme = (typeof THEMES)[number];

async function openGallery(
  page: Page,
  theme: Theme,
  width: number,
): Promise<void> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.addInitScript((mode) => {
    window.localStorage.setItem('harbour:theme', mode);
  }, theme);
  await page.goto(GALLERY_PATH);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Foundation gallery' }),
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

  // Report the exact selector and reason for each failing node, so a failure is
  // actionable without re-running with a debugger attached.
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
    test(`gallery · ${theme} · ${width}px`, async ({ page }) => {
      await openGallery(page, theme, width);

      await expectNoHorizontalOverflow(page);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/gallery-${theme}-${width}.png`,
        fullPage: true,
      });

      await expectNoSeriousAxeViolations(page);
    });
  }
}

test('gallery · reduced motion · dark · 768px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'dark', 768);

  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/gallery-dark-768-reduced-motion.png`,
    fullPage: true,
  });
  await expectNoSeriousAxeViolations(page);
});

/**
 * Builder rule 8 asks for a 200% zoom pass. Playwright has no browser-zoom API,
 * so zoom is emulated the way it actually behaves: the CSS viewport halves. A
 * 1440px window at 200% zoom gives a 720px layout viewport.
 */
test.describe('200% zoom (emulated: CSS viewport halved)', () => {
  for (const theme of THEMES) {
    for (const width of [1024, 1440]) {
      test(`gallery · ${theme} · ${width}px window @ 200%`, async ({ page }) => {
        await openGallery(page, theme, width / 2);

        await expectNoHorizontalOverflow(page);
        await expectNoSeriousAxeViolations(page);
      });
    }
  }
});

test('system mode follows the OS preference', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: VIEWPORT_HEIGHT });
  await page.addInitScript(() => {
    window.localStorage.setItem('harbour:theme', 'system');
  });

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(GALLERY_PATH);

  const system = page.getByRole('button', { name: 'System' });
  await expect(system).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Flipping the OS preference must move the page while the mode is `system`.
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await expectNoHorizontalOverflow(page);
  await expectNoSeriousAxeViolations(page);
});

test('theme toggle is operable from the keyboard alone', async ({ page }) => {
  await openGallery(page, 'dark', 1024);

  const dark = page.getByRole('button', { name: 'Dark' });
  const light = page.getByRole('button', { name: 'Light' });

  await expect(dark).toHaveAttribute('aria-pressed', 'true');

  await light.focus();
  await expect(light).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(light).toHaveAttribute('aria-pressed', 'true');
  await expect(dark).toHaveAttribute('aria-pressed', 'false');

  // And back again, to prove the mode is persisted, not just applied.
  await dark.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const stored = await page.evaluate(() =>
    window.localStorage.getItem('harbour:theme'),
  );
  expect(stored).toBe('dark');
});

/**
 * The glass section on its own, in both themes at 360 and 1440.
 *
 * The full-page shots above include it, but glass is the one surface whose
 * legibility depends entirely on what is behind it, so it gets a close-up over
 * its own aurora patch.
 */
test.describe('glass section over the aurora patch', () => {
  for (const theme of THEMES) {
    for (const width of [360, 1440]) {
      test(`glass · ${theme} · ${width}px`, async ({ page }) => {
        await openGallery(page, theme, width);

        const patch = page.locator('.aurora-patch');
        await expect(patch).toBeVisible();
        await patch.screenshot({
          path: `${SCREENSHOT_DIR}/glass-${theme}-${width}.png`,
        });

        await expectNoHorizontalOverflow(page);
        await expectNoSeriousAxeViolations(page);
      });
    }
  }
});
