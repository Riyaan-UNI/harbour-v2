import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { SAMPLE_MESSAGE } from '../src/lib/features/scam/sample';

/**
 * Brick 9 end-to-end gate — the `/app/scam` Scam Shield page.
 *
 * The first spec to enter the guarded app lane, so it also pins the two
 * things the lane never had: a seeded device-local profile (the guard reads
 * the legacy `harbour-profile` key), and the fact that `/app/scam` holds its
 * address instead of falling into the shell's catch-all — the bug where a
 * relative `<Navigate to="home">` from the splat route walked the URL to
 * `/app/scam/home/home`.
 *
 * Coverage, per spec §12: both themes at 320/360/390/768/1024/1440 with no
 * horizontal overflow, axe clean at every width, screenshots at 360 and 1440,
 * a reduced-motion pass; plus what the page is actually about — the tabs'
 * keyboard pattern, the X-ray's read and redaction, the SAMPLE panel's
 * unclickable link, and the drill from start to debrief.
 */

const SCAM_PATH = '/app/scam';
const THEMES = ['dark', 'light'] as const;
const WIDTHS = [320, 360, 390, 768, 1024, 1440] as const;
const VIEWPORT_HEIGHT = 900;

// Kept out of Playwright's outputDir so the screenshots survive a re-run.
const SCREENSHOT_DIR = 'screenshots';

type Theme = (typeof THEMES)[number];

/** The four safe answers in the default (`fake_parcel`) scenario, in order.
 *  Straight apostrophes — the ported bank uses them, and the accessible name
 *  must match the button's text exactly. */
const SAFE_ANSWERS = [
  "Check the tracking number on the courier's official website yourself",
  'Stop and contact your bank if you already entered card details',
  'Ignore the threat and report the message to 18222',
  'Never give details to an inbound caller; call the company yourself',
];

async function openScamShield(
  page: Page,
  theme: Theme,
  width: number,
): Promise<void> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.addInitScript(
    ({ mode, profile, profiles, activeId }) => {
      window.localStorage.setItem('harbour:theme', mode);
      // The guard reads the legacy key; the v2 keys keep the page's own
      // profile store in step so nothing re-derives a different shape.
      window.localStorage.setItem('harbour-profile', profile);
      window.localStorage.setItem('harbour:v1:profiles', profiles);
      window.localStorage.setItem('harbour:v1:activeProfileId', activeId);
    },
    {
      mode: theme,
      profile: JSON.stringify({
        name: 'Sam Okonkwo',
        country: 'Ghana',
        university: 'HKU',
        socials: {},
      }),
      profiles: JSON.stringify([
        {
          id: 'p_e2e',
          name: 'Sam Okonkwo',
          country: 'Ghana',
          university: 'HKU',
          socials: {},
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
      activeId: 'p_e2e',
    },
  );
  await page.goto(SCAM_PATH);
  // The address must hold. Before the route existed, the shell's relative
  // catch-all walked an unknown /app subpath deeper into itself.
  await expect(page).toHaveURL(new RegExp(`${SCAM_PATH}$`));
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(
    page.getByRole('heading', { level: 1, name: 'See through the message.' }),
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
    test(`scam shield · ${theme} · ${width}px`, async ({ page }) => {
      await openScamShield(page, theme, width);

      await expectNoHorizontalOverflow(page);

      if (SCREENSHOT_WIDTHS.has(width)) {
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/scam-shield-${theme}-${width}.png`,
          fullPage: true,
        });
      }

      await expectNoSeriousAxeViolations(page);
    });
  }
}

test('the shell and the page share one set of landmarks', async ({ page }) => {
  await openScamShield(page, 'dark', 1440);

  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.locator('#portal-main')).toBeVisible();
});

test('the tabs follow the ARIA keyboard pattern', async ({ page }) => {
  await openScamShield(page, 'dark', 1440);

  const xray = page.getByRole('tab', { name: 'Check a message' });
  const drill = page.getByRole('tab', { name: 'Practise a scam' });

  await expect(xray).toHaveAttribute('aria-selected', 'true');
  await expect(drill).toHaveAttribute('aria-selected', 'false');

  // Roving tabindex: only the selected tab is in the page's tab order.
  await expect(xray).toHaveAttribute('tabindex', '0');
  await expect(drill).toHaveAttribute('tabindex', '-1');

  // Each tab names its panel; the panel names its tab back. Ids come from
  // `useId`, so they carry colons — compared as strings, never as selectors.
  const panelId = await xray.getAttribute('aria-controls');
  expect(panelId).toBeTruthy();
  const panel = page.getByRole('tabpanel');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('id', panelId ?? '');
  await expect(panel).toHaveAttribute(
    'aria-labelledby',
    (await xray.getAttribute('id')) ?? '',
  );

  await xray.focus();
  await page.keyboard.press('ArrowRight');
  await expect(drill).toHaveAttribute('aria-selected', 'true');
  await expect(drill).toBeFocused();

  await page.keyboard.press('End');
  await expect(drill).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(xray).toHaveAttribute('aria-selected', 'true');

  // Wrapping: left from the first tab lands on the last.
  await page.keyboard.press('ArrowLeft');
  await expect(drill).toHaveAttribute('aria-selected', 'true');
});

test('the X-ray reads a message, hides identifiers and points onward', async ({
  page,
}) => {
  await openScamShield(page, 'dark', 1440);

  const textarea = page.locator('#scam-text');
  await expect(textarea).toBeVisible();

  // The counter is live text, not an announcement — counted from the string
  // itself so it cannot drift.
  const filled =
    'Your redelivery fee is due. Write to sam@example.com or call 91234567.';
  await textarea.fill(filled);
  await expect(page.getByText(`${filled.length} / 8,000`)).toBeVisible();

  await page.getByRole('button', { name: 'X-ray this message' }).click();

  // One indicator group — Medium, honestly, not the marketing mock's "High".
  const result = page.locator('.scam-xray__read');
  await expect(result.getByText('Medium risk').first()).toBeVisible();
  await expect(result.getByText('basic keyword check')).toBeVisible();
  await expect(
    result.getByText('Demo check only. This is not an AI review'),
  ).toBeVisible();

  // Redaction ran in the browser before the screen saw the text: the email
  // and the phone number, two identifiers hidden.
  await expect(
    result.getByText('Harbour hid 2 identifiers in your browser'),
  ).toBeVisible();

  // The helpline and the checklist handoff.
  await expect(result.locator('a[href="tel:18222"]')).toBeVisible();
  await expect(
    result.getByRole('link', { name: /Add a verification step/ }),
  ).toHaveAttribute('href', '/app/checklist');

  // The sample action refills the textarea with the fictional message and
  // returns the panel to its empty state.
  await page.getByRole('button', { name: 'Use fictional sample' }).click();
  await expect(textarea).toHaveValue(/hxxps:\/\/hk-post\.example\/claim/);
  await expect(
    page.getByText(`${SAMPLE_MESSAGE.length} / 8,000`),
  ).toBeVisible();
  await expect(page.locator('.scam-xray__read')).toHaveCount(0);
});

test('the SAMPLE panel shows a read and keeps the link unclickable', async ({
  page,
}) => {
  await openScamShield(page, 'dark', 1440);

  const sample = page.locator('.scam-sample');
  await expect(sample.getByText('fictional message')).toBeVisible();
  await expect(sample.getByText('Medium risk').first()).toBeVisible();
  await expect(sample.getByText('Medium risk — 1 of 4 patterns matched')).toBeVisible();
  await expect(sample.getByText(/hxxps:\/\/hk-post\.example\/claim/)).toBeVisible();

  // The old build's sample uses `hxxps://` so the link is inert by design.
  await expect(sample.locator('a')).toHaveCount(0);
});

test('the drill runs a scenario to a debrief', async ({ page }) => {
  await openScamShield(page, 'dark', 1440);

  await page.getByRole('button', { name: 'Practise a scam' }).first().click();
  const drill = page.locator('.scam-drill');
  await expect(
    drill.getByText(/this is practice\. Nothing here is a real message/),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Start practice' }).click();
  await expect(drill.getByText('Turn 1 of 4')).toBeVisible();
  await expect(drill.getByText('INCOMING · SIMULATED')).toBeVisible();

  for (const [index, answer] of SAFE_ANSWERS.entries()) {
    await page.getByRole('button', { name: answer }).click();
    if (index < SAFE_ANSWERS.length - 1) {
      await expect(drill.getByText(`Turn ${index + 2} of 4`)).toBeVisible();
    }
  }

  await expect(drill.getByText(/Good call\. You spotted:/).first()).toBeVisible();
  await page.getByRole('button', { name: 'See my debrief' }).click();

  await expect(drill.getByText('DEBRIEF')).toBeVisible();
  await expect(drill.getByRole('heading', { name: 'Harbour guard' })).toBeVisible();
  await expect(drill.getByText('resilience score')).toBeVisible();
  await expect(drill.getByText('You handled 4 of 4 moments safely.')).toBeVisible();

  await page.getByRole('button', { name: 'Practise again' }).click();
  await expect(drill.getByRole('heading', { name: 'Practise before it happens.' })).toBeVisible();
});

test('a reload drops a drill in progress — nothing persists', async ({ page }) => {
  await openScamShield(page, 'dark', 1440);
  await page.getByRole('button', { name: 'Practise a scam' }).first().click();
  await page.getByRole('button', { name: 'Start practice' }).click();
  await expect(page.getByText('Turn 1 of 4')).toBeVisible();

  await page.reload();
  await page.getByRole('tab', { name: 'Practise a scam' }).click();
  await expect(
    page.getByRole('heading', { name: 'Practise before it happens.' }),
  ).toBeVisible();
});

test('the recovery section carries the helpline, the rail and the disclaimer', async ({
  page,
}) => {
  await openScamShield(page, 'dark', 1440);

  const recovery = page.locator('.scam-recovery');
  await expect(
    recovery.getByRole('heading', { name: 'If it already happened' }),
  ).toBeVisible();
  await expect(recovery.locator('a[href="tel:18222"]').first()).toBeVisible();
  await expect(
    recovery.getByRole('navigation', { name: /Emergency and support numbers/ }),
  ).toBeVisible();
  await expect(
    recovery.getByText(/General information, not legal, financial or medical advice/),
  ).toBeVisible();
});

test('the page respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openScamShield(page, 'dark', 1440);

  await expectNoHorizontalOverflow(page);
  await expectNoSeriousAxeViolations(page);
});
