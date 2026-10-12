import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Brick 2a end-to-end gate — spec §12, extended for the shared components.
 *
 * For /dev/components, in both themes, at 320 / 360 / 390 / 768 / 1024 / 1440:
 *   - take a screenshot,
 *   - fail if the document scrolls horizontally,
 *   - fail on any serious or critical axe violation.
 *
 * Plus:
 *   - a reduced-motion pass,
 *   - a keyboard-only pass over Button, Input, Card and Toast,
 *   - the button heights the spec names (2.75 / 3.25rem, and 2.25rem on a fine
 *     pointer),
 *   - the UniversityLogo image-error fallback, and that it does not shift.
 */

const COMPONENTS_PATH = '/dev/components';
const THEMES = ['dark', 'light'] as const;
const WIDTHS = [320, 360, 390, 768, 1024, 1440] as const;
const VIEWPORT_HEIGHT = 900;

// Kept out of Playwright's outputDir so the screenshots survive a re-run and are
// easy to review. Gitignored.
const SCREENSHOT_DIR = 'screenshots';

type Theme = (typeof THEMES)[number];

async function openComponents(
  page: Page,
  theme: Theme,
  width: number,
): Promise<void> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.addInitScript((mode) => {
    window.localStorage.setItem('harbour:theme', mode);
  }, theme);
  await page.goto(COMPONENTS_PATH);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  // `data-theme` is set by the pre-paint script, so it is on before React has
  // mounted. Wait for real content, or a locator can race the first render.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Shared components' }),
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

// Full-page screenshots of this page are expensive: it is ~9,700px tall at
// 320px, and a full-page capture re-composites every glass surface over the
// fixed aurora. They are taken at 360 and 1440 (the two widths the brick
// reports on) rather than at all six, so the matrix stays fast and does not
// time out on a mapped drive. Overflow and axe run at every width.
const SCREENSHOT_WIDTHS = new Set([360, 1440]);

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    test(`components · ${theme} · ${width}px`, async ({ page }) => {
      await openComponents(page, theme, width);

      await expectNoHorizontalOverflow(page);

      if (SCREENSHOT_WIDTHS.has(width)) {
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/components-${theme}-${width}.png`,
          fullPage: true,
        });
      }

      await expectNoSeriousAxeViolations(page);
    });
  }
}

test('components · reduced motion · dark · 768px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openComponents(page, 'dark', 768);

  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/components-dark-768-reduced-motion.png`,
    fullPage: true,
  });
  await expectNoSeriousAxeViolations(page);
});

/**
 * The heights the spec names, read from the resolved box. A fine pointer (the
 * headless desktop default) gets the 2.25rem small button; a coarse pointer
 * would keep 2.75rem, which cannot be emulated through Playwright's media API.
 */
test('button heights follow the spec', async ({ page }) => {
  await openComponents(page, 'dark', 1024);

  const height = async (name: string): Promise<number> =>
    page
      .getByRole('button', { name, exact: true })
      .first()
      .evaluate((element) => element.getBoundingClientRect().height);

  expect(await height('size default')).toBeCloseTo(44, 0); // 2.75rem
  expect(await height('size large')).toBeCloseTo(52, 0); // 3.25rem
  expect(await height('size small')).toBeCloseTo(36, 0); // 2.25rem, fine pointer
});

/** A loading button keeps its width: the label is transparent, not removed. */
test('a loading button keeps the width of the same label', async ({ page }) => {
  await openComponents(page, 'dark', 1024);

  const idle = page.getByRole('button', { name: 'Saving', exact: true }).first();
  const loading = page.getByRole('button', { name: 'Saving', exact: true }).nth(1);

  const idleWidth = await idle.evaluate((el) => el.getBoundingClientRect().width);
  const loadingWidth = await loading.evaluate(
    (el) => el.getBoundingClientRect().width,
  );

  // Identical label, identical box: the spinner overlays rather than replaces.
  expect(loadingWidth).toBe(idleWidth);

  await expect(loading).toHaveAttribute('aria-busy', 'true');
  await expect(loading).toBeDisabled();

  // The label still occupies layout, which is what holds the width.
  const labelWidth = await loading
    .locator('span')
    .first()
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(labelWidth).toBeGreaterThan(0);
});

test('keyboard: Button activates, Input accepts text, Card responds to focus, Toast is polite', async ({
  page,
}) => {
  await openComponents(page, 'dark', 1024);

  // --- Button: reachable and activatable from the keyboard alone.
  const toastButton = page.getByRole('button', { name: 'Plain toast' });
  await toastButton.focus();
  await expect(toastButton).toBeFocused();
  await page.keyboard.press('Enter');

  // --- Toast: appears, and it is announced politely. Sonner keeps the live
  // region on its container section, not on each toast item.
  const toast = page.locator('[data-sonner-toast]').first();
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Saved to this device.');

  const liveRegion = page.locator('[aria-label^="Notifications"]').first();
  await expect(liveRegion).toHaveAttribute('aria-live', 'polite');

  // --- Input: focusable and typable.
  const input = page.getByLabel('What should we call you?');
  await input.focus();
  await expect(input).toBeFocused();
  await page.keyboard.type('Mei');
  await expect(input).toHaveValue('Mei');

  // --- Card: the interactive card mirrors focus within itself.
  const interactive = page.locator('.ui-card--interactive').first();
  const child = interactive.getByRole('button', { name: 'Focusable child' });
  await child.focus();
  await expect(child).toBeFocused();

  // Resolve `--border-strong` to a colour the browser will actually compute,
  // then compare it to the card's border while a child has focus.
  const expectedBorder = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--border-strong)';
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });

  expect(expectedBorder).toMatch(/^rgb/);
  await expect(interactive).toHaveCSS('border-top-color', expectedBorder);
});

/**
 * The logo's acronym fallback: point it at a file that is not there, and the
 * box shows the acronym in the plate's ink without changing size.
 */
test('UniversityLogo falls back to the acronym on an image error', async ({
  page,
}) => {
  await openComponents(page, 'dark', 1024);

  const logo = page.locator('[data-testid="logo-missing"] .ui-logo');

  // The image is lazy-loaded, so it only requests once it is near the viewport
  // — and only then does the error fire. Scroll it in before asserting.
  await logo.scrollIntoViewIfNeeded();
  await expect(logo).toBeVisible();
  await expect(logo).toContainText('CityU');
  await expect(logo.locator('img')).toHaveCount(0);

  const acronym = logo.locator('.ui-logo__acronym');
  await expect(acronym).toBeVisible();

  const colour = await acronym.evaluate((el) => getComputedStyle(el).color);
  // --logo-plate-ink is #0b3935 in both themes.
  expect(colour).toBe('rgb(11, 57, 53)');

  const weight = await acronym.evaluate((el) => getComputedStyle(el).fontWeight);
  expect(weight).toBe('600');

  // No layout shift: the box is a 3rem square before and after the fallback.
  const box = await logo.boundingBox();
  expect(box?.width).toBeCloseTo(48, 0);
  expect(box?.height).toBeCloseTo(48, 0);
});

/** The logo image that does load keeps its alt text as the accessible name. */
test('UniversityLogo exposes the full name as alt text', async ({ page }) => {
  await openComponents(page, 'dark', 1024);

  const image = page.getByAltText('The University of Hong Kong');
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
});
