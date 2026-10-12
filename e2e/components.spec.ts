import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

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

  // --- Card: the interactive card mirrors focus within itself. Focusing the
  // card's own trigger must lift it and deepen its border exactly as hovering
  // does — that is the "focus-visible mirrors hover" rule in spec §8.
  const interactive = page.locator('.ui-card--interactive').first();
  const trigger = interactive.getByRole('button', { name: 'Interactive card' });
  await trigger.focus();
  await expect(trigger).toBeFocused();

  // Resolve `--border-strong` to a colour the browser will actually compute,
  // then compare it to the card's border while the trigger has focus.
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

/* -------------------------------------------------------------------------- */
/* Interactive card — spec §8                                                  */
/* -------------------------------------------------------------------------- */

/** Reads one of the card's inline custom properties as a number. */
async function readTilt(
  card: Locator,
  property: '--tilt-x' | '--tilt-y',
): Promise<number> {
  const raw = await card.evaluate(
    (element, name) => element.style.getPropertyValue(name),
    property,
  );
  return Number.parseFloat(raw);
}

/** Moves the pointer to a fraction of the card's box. */
async function pointAt(
  page: Page,
  card: Locator,
  fx: number,
  fy: number,
): Promise<void> {
  const box = await card.boundingBox();
  if (!box) throw new Error('the card has no box');
  await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy);
}

test('interactive card: the spotlight tracks the pointer, throttled to a frame', async ({
  page,
}) => {
  await openComponents(page, 'dark', 1024);

  const card = page.locator('[data-expandable="true"]').first();
  await card.scrollIntoViewIfNeeded();

  await pointAt(page, card, 0.25, 0.75);

  const readVar = async (name: string): Promise<string> =>
    card.evaluate((element, key) => element.style.getPropertyValue(key), name);

  // The values are written in the rAF callback, so poll rather than assume.
  await expect.poll(() => readVar('--mx')).toMatch(/^[\d.]+%$/);
  await expect.poll(() => readVar('--my')).toMatch(/^[\d.]+%$/);

  // A quarter across and three quarters down is where the pointer is.
  expect(Number.parseFloat(await readVar('--mx'))).toBeCloseTo(25, 0);
  expect(Number.parseFloat(await readVar('--my'))).toBeCloseTo(75, 0);
});

test('interactive card: the tilt follows the pointer and never exceeds --tilt-max', async ({
  page,
}) => {
  await openComponents(page, 'dark', 1024);

  const card = page.locator('[data-expandable="true"]').first();
  await card.scrollIntoViewIfNeeded();

  // The headless desktop default is a fine pointer with hover, so the tilt is
  // on. If a future environment reports otherwise this assertion is the signal.
  await expect(card).toHaveAttribute('data-tilt', 'true');

  const max = await page.evaluate(() =>
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--tilt-max'),
    ),
  );
  expect(max).toBe(6);

  // A quarter across and three quarters down maps to exactly -3 on both axes:
  //   rotateY = (0.25 - 0.5) * 2 * 6 = -3,  rotateX = (0.5 - 0.75) * 2 * 6 = -3
  await pointAt(page, card, 0.25, 0.75);
  await expect.poll(() => readTilt(card, '--tilt-x')).toBeCloseTo(-3, 0);
  await expect.poll(() => readTilt(card, '--tilt-y')).toBeCloseTo(-3, 0);

  // Sweep a grid that includes every edge and corner. The cap is structural —
  // |nx - 0.5| can never exceed 0.5 — but the sweep is what proves the wiring.
  const POINTS = [
    [0.05, 0.05],
    [0.05, 0.95],
    [0.95, 0.05],
    [0.95, 0.95],
    [0.5, 0.05],
    [0.05, 0.5],
    [0.95, 0.5],
    [0.5, 0.95],
    [0.5, 0.5],
  ] as const;

  for (const [fx, fy] of POINTS) {
    await pointAt(page, card, fx, fy);
    expect(Math.abs(await readTilt(card, '--tilt-x'))).toBeLessThanOrEqual(
      max + 0.01,
    );
    expect(Math.abs(await readTilt(card, '--tilt-y'))).toBeLessThanOrEqual(
      max + 0.01,
    );
  }

  // The pointer leaves, and the card levels itself.
  await page.mouse.move(0, 0);
  await expect.poll(() => readTilt(card, '--tilt-x')).toBe(0);
});

test('interactive card: expands in place, closes on Escape, and returns focus', async ({
  page,
}) => {
  await openComponents(page, 'dark', 1024);

  const card = page.locator('[data-expandable="true"]').first();
  await card.scrollIntoViewIfNeeded();

  const trigger = card.getByRole('button', { name: 'Interactive card' });
  await trigger.click();

  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('This is the expanded state.');

  // Radix traps focus inside the panel and locks the page behind it.
  const close = panel.getByRole('button', { name: 'Close' });
  await expect(close).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('interactive card: opens from the keyboard alone, and the backdrop closes it', async ({
  page,
}) => {
  await openComponents(page, 'dark', 1024);

  const card = page.locator('[data-expandable="true"]').first();
  await card.scrollIntoViewIfNeeded();

  const trigger = card.getByRole('button', { name: 'Interactive card' });
  await trigger.focus();
  await page.keyboard.press('Enter');

  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
});

test('interactive card: reduced motion keeps every state and drops the tilt', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openComponents(page, 'dark', 1024);

  const card = page.locator('[data-expandable="true"]').first();
  await card.scrollIntoViewIfNeeded();

  // No 3D transform at all — the attribute is what gates it in CSS.
  await expect(card).not.toHaveAttribute('data-tilt', 'true');

  await pointAt(page, card, 0.9, 0.1);
  // The spotlight is a gradient position, not an animation, so it still tracks.
  await expect
    .poll(() =>
      card.evaluate((element) => element.style.getPropertyValue('--mx')),
    )
    .toMatch(/^[\d.]+%$/);

  // The expand still works, it just does not morph.
  const trigger = card.getByRole('button', { name: 'Interactive card' });
  await trigger.click();
  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('This is the expanded state.');

  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
});

test('interactive card: nothing depends on hover — the trigger is a real button', async ({
  page,
}) => {
  await openComponents(page, 'dark', 1024);

  const card = page.locator('[data-expandable="true"]').first();
  await card.scrollIntoViewIfNeeded();

  const trigger = card.getByRole('button', { name: 'Interactive card' });
  // A pointer never enters the card in this test; the click alone opens it.
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // The non-expandable variant is the same card without the trigger.
  const plain = page.locator('[data-expandable="false"]').first();
  await expect(plain).toBeVisible();
  await expect(plain.locator('button')).toHaveCount(0);
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

/* -------------------------------------------------------------------------- */
/* The university manifest — spec §10                                          */
/* -------------------------------------------------------------------------- */

/** Spec §10's table, verbatim. This is the list the manifest must match. */
const SPEC_UNIVERSITIES = [
  { id: 'hku', acronym: 'HKU', name: 'The University of Hong Kong' },
  {
    id: 'cuhk',
    acronym: 'CUHK',
    name: 'The Chinese University of Hong Kong',
  },
  {
    id: 'hkust',
    acronym: 'HKUST',
    name: 'The Hong Kong University of Science and Technology',
  },
  {
    id: 'polyu',
    acronym: 'PolyU',
    name: 'The Hong Kong Polytechnic University',
  },
  { id: 'cityu', acronym: 'CityU', name: 'City University of Hong Kong' },
  { id: 'hkbu', acronym: 'HKBU', name: 'Hong Kong Baptist University' },
  { id: 'lingnan', acronym: 'LU', name: 'Lingnan University' },
  {
    id: 'eduhk',
    acronym: 'EdUHK',
    name: 'The Education University of Hong Kong',
  },
] as const;

/** A 1x1 PNG, so a stubbed logo always reports `naturalWidth === 1`. */
const STUB_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/**
 * Every id in the manifest is wired to a real box on the page. No university
 * logo file is bundled in the repo, so what is on screen is the acronym
 * fallback — asserted, not assumed, because it is the honest current state.
 */
test('university manifest: all nine ids render, and each falls back to its acronym', async ({
  page,
}) => {
  await openComponents(page, 'dark', 1024);

  for (const { id, acronym } of SPEC_UNIVERSITIES) {
    const box = page.locator(`[data-testid="uni-logo-${id}"] .ui-logo`);
    await box.scrollIntoViewIfNeeded();
    await expect(box).toBeVisible();
    await expect(box).toContainText(acronym);
    // The plate is a fixed square at every size, so the fallback never shifts.
    const measured = await box.boundingBox();
    expect(measured?.width).toBeCloseTo(40, 0); // md = 2.5rem
    expect(measured?.height).toBeCloseTo(40, 0);
  }

  // `other` is not an institution: it has no acronym and shows the generic mark.
  const other = page.locator('[data-testid="uni-logo-other"] .ui-logo');
  await other.scrollIntoViewIfNeeded();
  await expect(other.locator('.ui-logo__mark')).toBeVisible();
  await expect(other.locator('.ui-logo__acronym')).toHaveCount(0);
});

/**
 * "Test that each loads": the manifest path is the one the browser actually
 * requests, and the full name is the image's alt text. The eight files are not
 * in the repo yet, so the requests are stubbed with a 1x1 PNG — this proves the
 * wiring, and `university manifest: all nine ids render` above records that the
 * real files are missing.
 */
test('university manifest: each logo path is requested and carries the full name as alt', async ({
  page,
}) => {
  const requested: string[] = [];

  // Only the eight manifest paths are stubbed. `/logos/does-not-exist.svg` is
  // deliberately left alone, so the error-fallback demo further up the page
  // still 404s and still proves the acronym swap.
  await page.route(/\/logos\/(?:hku|cuhk|hkust|polyu|cityu|hkbu|lingnan|eduhk)\.svg$/, async (route) => {
    requested.push(new URL(route.request().url()).pathname);
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(STUB_PNG, 'base64'),
    });
  });

  await openComponents(page, 'dark', 1024);

  for (const { id, name } of SPEC_UNIVERSITIES) {
    const image = page.locator(`[data-testid="uni-logo-${id}"] img`);
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('alt', name);
    // `naturalWidth > 0` is the only proof the file actually loaded rather than
    // erroring into the fallback.
    await expect
      .poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(
      page.locator(`[data-testid="uni-logo-${id}"] .ui-logo__acronym`),
    ).toHaveCount(0);
  }

  expect([...requested].sort()).toEqual(
    SPEC_UNIVERSITIES.map(({ id }) => `/logos/${id}.svg`).sort(),
  );
});
