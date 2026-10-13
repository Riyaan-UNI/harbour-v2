import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Brick 4 end-to-end gate — spec §12.
 *
 * For `/`, in both themes, at 320 / 360 / 390 / 768 / 1024 / 1440:
 *   - take a screenshot at 360 and 1440,
 *   - fail if the document scrolls horizontally,
 *   - fail on any serious or critical axe violation.
 *
 * Plus the things this brick is actually about:
 *   - every section heading, in the addendum's order, and the three reserved
 *     ids the nav has pointed at since Brick 3 (`#tools`, `#how-it-works`,
 *     `#trust`) finally resolving,
 *   - honesty labels on every sample, demo and simulation (Addendum 1 rule 2),
 *   - the expandable tool cards from the keyboard,
 *   - the two canned demo examples and the drill teaser's feedback,
 *   - the masked demo balance in the preview strip,
 *   - the reduced-motion and 200% passes.
 *
 * The sections below the hero are one lazy chunk, so every test waits for the
 * first section heading before it asserts anything about them.
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
  // The hero's entrance fades the CTAs up from opacity 0; an axe scan that
  // runs mid-tween measures a half-painted button. Wait for the settle —
  // generously, because the timeline waits on fonts first.
  await expect(page.locator('#top')).toHaveAttribute(
    'data-entrance',
    'entered',
    { timeout: 30_000 },
  );
  // The below-the-fold sections are a lazy chunk; wait for the first one.
  await expect(
    page.getByRole('heading', { name: 'Four tools for your first weeks.' }),
  ).toBeVisible({ timeout: 30_000 });
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
    test(`landing sections · ${theme} · ${width}px`, async ({ page }) => {
      await openLanding(page, theme, width);

      await expectNoHorizontalOverflow(page);

      if (SCREENSHOT_WIDTHS.has(width)) {
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/landing-sections-${theme}-${width}.png`,
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

test('landing sections: every section heading is present, in order', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  const headings = [
    'Four tools for your first weeks.',
    'Before you pay a deposit.',
    'Arriving is the easy part.',
    'Say it your way. We will make it clear.',
    'Rehearse the hard conversation first.',
    'A look at what is next.',
    'Three steps to feeling at home.',
    'Built to be careful with you.',
    'Come in from the storm.',
  ];

  const positions: number[] = [];
  for (const heading of headings) {
    const element = page.getByRole('heading', { level: 2, name: heading });
    await expect(element).toBeVisible();
    const box = await element.boundingBox();
    positions.push(box?.y ?? Number.NaN);
  }

  // The addendum's order, read from the page rather than from this list.
  const sorted = [...positions].sort((a, b) => a - b);
  expect(positions).toEqual(sorted);

  // Still exactly one h1 on the page.
  expect(await page.getByRole('heading', { level: 1 }).count()).toBe(1);
});

test('landing sections: the nav anchors resolve to real sections', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  for (const [label, id] of [
    ['Tools', 'tools'],
    ['How it works', 'how-it-works'],
    ['Trust', 'trust'],
  ] as const) {
    const target = page.locator(`#${id}`);
    await expect(target).toHaveCount(1);

    // The sticky bar is 4.25rem; the section's scroll margin clears it.
    const scrollMargin = await target.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).scrollMarginTop),
    );
    expect(scrollMargin).toBeGreaterThanOrEqual(68);

    // And the nav link actually reaches it: the URL hash lands, and the
    // section's heading is inside the viewport afterwards.
    await page.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(900);
    expect(box!.y + box!.height).toBeGreaterThan(0);
  }
});

/* -------------------------------------------------------------------------- */
/* Honesty labels — Addendum 1 rule 2                                          */
/* -------------------------------------------------------------------------- */

test('landing sections: every sample, demo and simulation is labelled', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  // The four tool cards carry SAMPLE badges.
  const tools = page.locator('#tools');
  await expect(tools.getByText('sample', { exact: true })).toHaveCount(4);

  // The live demo is labelled DEMO on the section and on the result.
  const demo = page.locator('section', {
    has: page.getByRole('heading', { name: 'Say it your way. We will make it clear.' }),
  });
  await expect(demo.getByText('demo', { exact: true }).first()).toBeVisible();

  // The practice teaser is a simulation.
  await expect(
    page.getByText('practice, not a real message', { exact: false }),
  ).toBeVisible();

  // The preview strip carries one of each badge, permanently.
  const preview = page.locator('section', {
    has: page.getByRole('heading', { name: 'A look at what is next.' }),
  });
  await expect(preview.getByText('simulation', { exact: true })).toBeVisible();
  await expect(preview.getByText('demo', { exact: true })).toBeVisible();
  await expect(preview.getByText('sample', { exact: true })).toBeVisible();

  // Voice SOS never reads as a real call: 999 is on the card.
  await expect(
    preview.getByRole('link', { name: 'For danger, call 999' }),
  ).toHaveAttribute('href', 'tel:999');
});

/* -------------------------------------------------------------------------- */
/* The expandable tool cards                                                   */
/* -------------------------------------------------------------------------- */

test('landing sections: a tool card expands from the keyboard and closes on Escape', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  const trigger = page.getByRole('button', { name: 'Scam X-ray' });
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('heading', { name: 'Scam X-ray' }),
  ).toBeVisible();
  await expect(dialog).toContainText('hides emails, phone numbers');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('landing sections: the settle-in sample shows a progress ring and its words', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  const card = page.locator('.ui-card-hit', {
    has: page.getByRole('heading', { name: 'Settle-in list' }),
  });
  await expect(card.locator('svg.progress-ring')).toHaveCount(1);
  await expect(card.getByText('1 of 3 done')).toBeVisible();

  // The ring is a third full: the dash array is a third of the circumference.
  const dash = await card
    .locator('.progress-ring__value')
    .getAttribute('stroke-dasharray');
  expect(dash).toBe('87.96 263.89');
});

/* -------------------------------------------------------------------------- */
/* The live demo                                                               */
/* -------------------------------------------------------------------------- */

test('landing sections: the demo answers both canned examples', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  // Scoped to the demo section: the Cantonese helper card above carries the
  // same worked phrase as a sample, so an unscoped locator matches both.
  const demo = page.locator('section', {
    has: page.getByRole('heading', {
      name: 'Say it your way. We will make it clear.',
    }),
  });

  await page.getByRole('button', { name: 'Make it clear' }).click();

  await expect(
    demo.getByText('Please take me to Central MTR station.'),
  ).toBeVisible();
  await expect(demo.getByText('唔該，我想去中環站。')).toBeVisible();
  await expect(
    demo.getByText('m4 goi1, ngo5 soeng2 heoi3 zung1 waan4 zaam6'),
  ).toBeVisible();

  // Switching the example swaps the input quote and clears the answer.
  await page.getByRole('button', { name: 'A landlord question' }).click();
  await expect(
    demo.getByText(/my landlord says I have to pay two months deposit/),
  ).toBeVisible();
  await expect(
    demo.getByText('Please take me to Central MTR station.'),
  ).toHaveCount(0);

  await page.getByRole('button', { name: 'Make it clear' }).click();
  await expect(
    demo.getByText('Is a two-month deposit normal for a rental?'),
  ).toBeVisible();
  await expect(demo.getByText('請問租屋要俾兩個月按金係咪正常？')).toBeVisible();
});

/* -------------------------------------------------------------------------- */
/* The practice teaser                                                        */
/* -------------------------------------------------------------------------- */

test('landing sections: the drill teaser names the signal, both ways', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  const safe = page.getByRole('button', {
    name: "Check the tracking number on the courier's official website yourself",
  });
  await safe.click();

  await expect(page.getByText('A good instinct')).toBeVisible();
  await expect(page.getByText(/The signal was Small-fee bait/)).toBeVisible();

  // Every option locks once one is picked, and the reset restores them.
  const risky = page.getByRole('button', {
    name: 'Open the link and pay the small fee',
  });
  await expect(risky).toBeDisabled();

  await page.getByRole('button', { name: 'Practise again' }).click();
  await expect(risky).toBeEnabled();

  await risky.click();
  await expect(page.getByText('Worth another run')).toBeVisible();
});

/* -------------------------------------------------------------------------- */
/* The preview strip                                                           */
/* -------------------------------------------------------------------------- */

test('landing sections: the demo balance is masked until asked for', async ({
  page,
}) => {
  await openLanding(page, 'dark', 1024);

  const preview = page.locator('section', {
    has: page.getByRole('heading', { name: 'A look at what is next.' }),
  });

  // The flat preview cards carry no class of their own, so the masked value
  // and its button are found by their unique text inside the section.
  await expect(preview.getByText('•••')).toBeVisible();
  await expect(preview.getByText('3 demo points')).toHaveCount(0);

  await preview.getByRole('button', { name: 'Show' }).click();
  await expect(preview.getByText('3 demo points')).toBeVisible();
  await expect(preview.getByText('•••')).toHaveCount(0);
  await expect(
    preview.getByText('Demo points have no monetary value'),
  ).toBeVisible();

  await preview.getByRole('button', { name: 'Hide' }).click();
  await expect(preview.getByText('•••')).toBeVisible();
});

/* -------------------------------------------------------------------------- */
/* The progress ring on the dev page                                           */
/* -------------------------------------------------------------------------- */

test('components: the progress ring renders and clamps', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: VIEWPORT_HEIGHT });
  await page.goto(COMPONENTS_PATH);

  await expect(
    page.getByRole('heading', { name: 'Progress ring' }),
  ).toBeVisible();

  const rings = page.locator('svg.progress-ring');
  // 3 sizes + 3 values + 3 clamped.
  await expect(rings).toHaveCount(9);

  // A NaN value still renders a ring rather than throwing.
  const last = rings.nth(8);
  const dash = await last
    .locator('.progress-ring__value')
    .getAttribute('stroke-dasharray');
  expect(dash).toBe('0.00 263.89');
});

/* -------------------------------------------------------------------------- */
/* Motion and zoom                                                            */
/* -------------------------------------------------------------------------- */

test('landing sections · reduced motion · dark · 768px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page, 'dark', 768);

  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/landing-sections-dark-768-reduced-motion.png`,
    fullPage: true,
  });
  await expectNoSeriousAxeViolations(page);
});

test('landing sections · reduced motion skips the thinking delay', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page, 'dark', 1024);

  await page.getByRole('button', { name: 'Make it clear' }).click();
  // No 450ms thinking state: the answer is there immediately.
  await expect(
    page
      .locator('section', {
        has: page.getByRole('heading', {
          name: 'Say it your way. We will make it clear.',
        }),
      })
      .getByText('Please take me to Central MTR station.'),
  ).toBeVisible();
  await expect(page.getByText('Making it clear…')).toHaveCount(0);
});

test.describe('200% zoom (emulated: CSS viewport halved)', () => {
  for (const theme of THEMES) {
    for (const width of [1024, 1440]) {
      test(`landing sections · ${theme} · ${width}px window @ 200%`, async ({
        page,
      }) => {
        await openLanding(page, theme, width / 2);

        await expectNoHorizontalOverflow(page);
        await expectNoSeriousAxeViolations(page);
      });
    }
  }
});

test.describe('200% text size (root font-size doubled)', () => {
  for (const theme of THEMES) {
    test(`landing sections · ${theme} · 1024px @ 200% text size`, async ({
      page,
    }) => {
      await openLanding(page, theme, 1024);
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });

      await expectNoHorizontalOverflow(page);
      await expectNoSeriousAxeViolations(page);
    });
  }
});
