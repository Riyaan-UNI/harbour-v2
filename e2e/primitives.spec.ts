import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Brick 1 end-to-end gate — spec §12, extended for the primitives.
 *
 * For /dev/primitives, in both themes, at 320 / 360 / 390 / 768 / 1024 / 1440:
 *   - take a screenshot,
 *   - fail if the document scrolls horizontally,
 *   - fail on any serious or critical axe violation.
 *
 * Plus:
 *   - the Bento column count at each of its three stages,
 *   - the container-query demo answering to its container, not the viewport,
 *   - the 200% zoom pass (CSS viewport halved), and
 *   - a text-size-only pass (root font-size 200%), which is a different test:
 *     zoom shrinks the viewport, text-size scaling does not, and only the
 *     second one proves the layout is built on rem rather than px.
 */

const PRIMITIVES_PATH = '/dev/primitives';
const THEMES = ['dark', 'light'] as const;
const WIDTHS = [320, 360, 390, 768, 1024, 1440] as const;
const VIEWPORT_HEIGHT = 900;

// Kept out of Playwright's outputDir so the screenshots survive a re-run and are
// easy to review. Gitignored.
const SCREENSHOT_DIR = 'screenshots';

type Theme = (typeof THEMES)[number];

async function openPrimitives(
  page: Page,
  theme: Theme,
  width: number,
): Promise<void> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.addInitScript((mode) => {
    window.localStorage.setItem('harbour:theme', mode);
  }, theme);
  await page.goto(PRIMITIVES_PATH);
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
    test(`primitives · ${theme} · ${width}px`, async ({ page }) => {
      await openPrimitives(page, theme, width);

      await expect(
        page.getByRole('heading', { level: 1, name: 'Layout primitives' }),
      ).toBeVisible();

      await expectNoHorizontalOverflow(page);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/primitives-${theme}-${width}.png`,
        fullPage: true,
      });

      await expectNoSeriousAxeViolations(page);
    });
  }
}

/**
 * Bento: 12 columns from 64em (1024px), 2 from 40em (640px), 1 below.
 *
 * Read the resolved `grid-template-columns`, which lists one track per column,
 * rather than trusting a class name.
 */
test.describe('Bento column counts', () => {
  const CASES = [
    { width: 320, columns: 1 },
    { width: 390, columns: 1 },
    { width: 768, columns: 2 },
    { width: 1024, columns: 12 },
    { width: 1440, columns: 12 },
  ] as const;

  for (const theme of THEMES) {
    for (const { width, columns } of CASES) {
      test(`bento · ${theme} · ${width}px → ${columns} column(s)`, async ({
        page,
      }) => {
        await openPrimitives(page, theme, width);

        const tracks = await page
          .getByTestId('bento')
          .evaluate(
            (element) =>
              getComputedStyle(element).gridTemplateColumns.split(/\s+/).length,
          );

        expect(tracks).toBe(columns);
      });
    }
  }
});

/**
 * The container-query demo: identical markup, two container sizes, different
 * layouts at the same viewport. This is the claim the `.cq` wrapper makes, so
 * it is asserted rather than eyeballed.
 */
test('container queries answer to the container, not the viewport', async ({
  page,
}) => {
  await openPrimitives(page, 'dark', 1440);

  const columns = async (testId: string): Promise<number> =>
    page
      .getByTestId(testId)
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(/\s+/).length);

  // Narrow container (28rem): @lg (32rem) does not match, @xs (20rem) does.
  expect(await columns('cq-narrow')).toBe(2);

  // Page container (75rem): both match.
  expect(await columns('cq-wide')).toBe(3);
});

test('primitives · reduced motion · dark · 768px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openPrimitives(page, 'dark', 768);

  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/primitives-dark-768-reduced-motion.png`,
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
      test(`primitives · ${theme} · ${width}px window @ 200%`, async ({
        page,
      }) => {
        await openPrimitives(page, theme, width / 2);

        await expectNoHorizontalOverflow(page);
        await expectNoSeriousAxeViolations(page);
      });
    }
  }
});

/**
 * Text-size-only scaling: the root font size doubles and the viewport does not
 * move. Every size in the project is rem, so the layout must scale and still
 * fit. Media queries stay put, because em in a media query resolves against the
 * initial font size, not against `html`.
 */
test.describe('200% text size (root font-size doubled)', () => {
  for (const theme of THEMES) {
    test(`primitives · ${theme} · 1024px @ 200% text size`, async ({ page }) => {
      await openPrimitives(page, theme, 1024);

      await page.addStyleTag({ content: 'html { font-size: 200%; }' });

      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/primitives-${theme}-1024-text-200.png`,
        fullPage: true,
      });
      await expectNoSeriousAxeViolations(page);
    });
  }
});
