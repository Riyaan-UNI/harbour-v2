import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Phase 3 end-to-end gate — the rebuilt `/app/profile`.
 *
 * Covers the four faces the page has to hold at once:
 *
 *   - the own profile (view + edit + save persistence),
 *   - the preview toggle (swaps to the public card and back, and renders no
 *     editing controls while previewing),
 *   - the `:userId` sample view (public card + SAMPLE badge + Follow toggle),
 *   - an unknown `:userId` (the honest not-found state),
 *
 * plus the definition-of-done matrix: both themes, five widths with no
 * horizontal overflow, one `h1`, and axe clean (no serious or critical).
 *
 * The device-local profile is seeded the way `scam-shield.spec.ts` does — the
 * legacy `harbour-profile` key the context reads, plus the two v2 keys so the
 * page's own store stays in step.
 */

const PROFILE_PATH = '/app/profile';
const THEMES = ['dark', 'light'] as const;
const WIDTHS = [360, 390, 768, 1024, 1440] as const;
const VIEWPORT_HEIGHT = 900;

// Kept out of Playwright's outputDir so screenshots survive a re-run.
const SCREENSHOT_DIR = 'screenshots';

type Theme = (typeof THEMES)[number];

/** A profile whose country is a display string and university a manifest id. */
const SEED = {
  id: 'p_profile_e2e',
  name: 'Sam Okonkwo',
  country: 'GH',
  university: 'hku',
  socials: { instagram: 'sam.ok' },
  mascotId: 'whale',
  createdAt: '2026-01-01T00:00:00.000Z',
} as const;

async function seedProfile(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript(
    ({ mode, profile, profiles, activeId, friends }) => {
      // Seed once. `addInitScript` re-runs on every navigation (including a
      // reload), so guarding on the presence of the key lets a test assert that
      // an in-app save survives a reload instead of being overwritten.
      if (!window.localStorage.getItem('harbour-profile')) {
        window.localStorage.setItem('harbour:theme', mode);
        window.localStorage.setItem('harbour-profile', profile);
        window.localStorage.setItem('harbour:v1:profiles', profiles);
        window.localStorage.setItem('harbour:v1:activeProfileId', activeId);
        window.localStorage.setItem('harbour-friends', friends);
      }
    },
    {
      mode: theme,
      profile: JSON.stringify(SEED),
      profiles: JSON.stringify([SEED]),
      activeId: SEED.id,
      friends: JSON.stringify([]),
    },
  );
}

async function openProfile(
  page: Page,
  theme: Theme,
  width: number,
  path: string = PROFILE_PATH,
): Promise<void> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await seedProfile(page, theme);
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

/** Seed with one friend already saved, for the friends-list branch. */
async function openWithFriend(page: Page, theme: Theme, width: number): Promise<void> {
  await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await page.addInitScript(
    ({ mode, profile, profiles, activeId }) => {
      window.localStorage.setItem('harbour:theme', mode);
      window.localStorage.setItem('harbour-profile', profile);
      window.localStorage.setItem('harbour:v1:profiles', profiles);
      window.localStorage.setItem('harbour:v1:activeProfileId', activeId);
      window.localStorage.setItem('harbour-friends', JSON.stringify(['lina-chen']));
    },
    {
      mode: theme,
      profile: JSON.stringify(SEED),
      profiles: JSON.stringify([SEED]),
      activeId: SEED.id,
    },
  );
  await page.goto(PROFILE_PATH);
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

/* ------------------------------------------------------------------------- */
/* The responsive matrix — both themes, five widths                           */
/* ------------------------------------------------------------------------- */

const SCREENSHOT_WIDTHS = new Set([360, 768, 1440]);

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    test(`own profile · ${theme} · ${width}px`, async ({ page }) => {
      await openProfile(page, theme, width);

      await expect(
        page.getByRole('heading', { level: 1, name: 'Sam Okonkwo' }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);

      if (SCREENSHOT_WIDTHS.has(width)) {
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/profile-own-${theme}-${width}.png`,
          fullPage: true,
        });
      }

      await expectNoSeriousAxeViolations(page);
    });
  }
}

test('the page has exactly one h1', async ({ page }) => {
  await openProfile(page, 'dark', 1440);
  await expect(page.locator('h1')).toHaveCount(1);
});

/* ------------------------------------------------------------------------- */
/* Edit → change name → save persists                                         */
/* ------------------------------------------------------------------------- */

test('editing the display name saves it to this device', async ({ page }) => {
  await openProfile(page, 'dark', 1440);

  await page.getByRole('button', { name: 'Edit profile' }).click();

  // The form replaces the view rows inside the same card — no second card.
  const nameField = page.getByLabel('Display name');
  await expect(nameField).toBeVisible();

  await nameField.fill('Wanjiku Kamau');
  await page.getByRole('button', { name: 'Save changes' }).click();

  // Back in view mode, the ledger shows the new name and the masthead follows.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Wanjiku Kamau' }),
  ).toBeVisible();
  await expect(page.getByText('Changes saved on this device.')).toBeVisible();

  // It persists: the store wrote the legacy key this device reads.
  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('harbour-profile') || '{}'),
  );
  expect(stored.name).toBe('Wanjiku Kamau');
});

test('cancel discards edits', async ({ page }) => {
  await openProfile(page, 'dark', 1440);
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page.getByLabel('Display name').fill('Throwaway Name');
  await page.getByRole('button', { name: 'Cancel' }).first().click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sam Okonkwo' }),
  ).toBeVisible();
});

test('the mascot picker is a real radio group and survives a save', async ({
  page,
}) => {
  await openProfile(page, 'dark', 1440);
  await page.getByRole('button', { name: 'Edit profile' }).click();

  const group = page.getByRole('group', { name: 'Choose your mascot' });
  await expect(group).toBeVisible();

  // All twelve kinds are offered — the legacy four-kind clamp is gone.
  await expect(
    page.getByRole('radio', { name: 'Octopus' }),
  ).toBeVisible();
  await expect(
    page.getByRole('radio', { name: 'Jellyfish' }),
  ).toBeVisible();

  // Pick a non-legacy kind and save; it must not collapse to "otter".
  await page.getByRole('radio', { name: 'Jellyfish' }).check();
  await expect(page.getByRole('radio', { name: 'Jellyfish' })).toBeChecked();

  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Changes saved on this device.')).toBeVisible();

  // The saved record kept the non-legacy kind — it did not clamp to "otter".
  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('harbour-profile') || '{}'),
  );
  expect(stored.mascotId).toBe('jellyfish');

  // Re-entering edit mode shows the saved choice still selected.
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await expect(page.getByRole('radio', { name: 'Jellyfish' })).toBeChecked();
});

/* ------------------------------------------------------------------------- */
/* Preview toggle                                                             */
/* ------------------------------------------------------------------------- */

test('the preview toggle swaps to the public card and back', async ({ page }) => {
  await openProfile(page, 'dark', 1440);

  const toggle = page.getByRole('button', { name: 'See how others see you' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();

  // The preview bar is announced, and no editing control is rendered.
  await expect(
    page.getByRole('heading', {
      name: 'Preview — this is how others see your profile.',
    }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to editing' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Edit profile' }),
  ).toHaveCount(0);
  await expect(page.getByLabel('Display name')).toHaveCount(0);

  // Still exactly one h1 in preview.
  await expect(page.locator('h1')).toHaveCount(1);

  await page.getByRole('button', { name: 'Back to editing' }).click();
  await expect(
    page.getByRole('button', { name: 'See how others see you' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit profile' })).toBeVisible();
});

/* ------------------------------------------------------------------------- */
/* The :userId sample view                                                    */
/* ------------------------------------------------------------------------- */

test('a sample person renders the public card with badge and Follow', async ({
  page,
}) => {
  await openProfile(page, 'dark', 1440, '/app/profile/lina-chen');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Lina Chen' }),
  ).toBeVisible();
  await expect(page.getByText('This is a sample profile.')).toBeVisible();
  await expect(page.getByText('sample', { exact: true })).toBeVisible();

  const follow = page.getByRole('button', { name: 'Follow' });
  await expect(follow).toHaveAttribute('aria-pressed', 'false');
  await follow.click();
  await expect(page.getByRole('button', { name: 'Following' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  // Back-link to the directory is present.
  await expect(
    page.getByRole('link', { name: /People directory/ }),
  ).toBeVisible();

  await expectNoSeriousAxeViolations(page);
});

test('an unknown sample id shows the honest not-found state', async ({ page }) => {
  await openProfile(page, 'dark', 1440, '/app/profile/nobody-here');
  await expect(
    page.getByRole('heading', { level: 1, name: 'We could not find that profile.' }),
  ).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expectNoSeriousAxeViolations(page);
});

/* ------------------------------------------------------------------------- */
/* Friends, empty state, and no-profile state                                 */
/* ------------------------------------------------------------------------- */

test('a saved friend appears in the friends list and links to their profile', async ({
  page,
}) => {
  await openWithFriend(page, 'dark', 1440);
  const friendLink = page.getByRole('link', { name: /Lina Chen/ });
  await expect(friendLink).toBeVisible();
  await expect(friendLink).toHaveAttribute('href', '/app/profile/lina-chen');
});

test('an empty friends list explains itself and points at the directory', async ({
  page,
}) => {
  await openProfile(page, 'dark', 1440);
  await expect(
    page.getByText('Your friend list is empty. Search the demo directory to find people.'),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Search the demo directory' }),
  ).toHaveAttribute('href', '/app/people');
});

test('with no active profile the guard sends you to login', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: VIEWPORT_HEIGHT });
  // No seed: the `/app/*` guard owns the "not signed in" case (spec §12), so
  // the profile page's own warm start state is a defensive branch behind it.
  await page.goto(PROFILE_PATH);

  await expect(page).toHaveURL(/\/login$/);
});

/* ------------------------------------------------------------------------- */
/* Reduced motion                                                             */
/* ------------------------------------------------------------------------- */

test('the page respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openProfile(page, 'dark', 1440);
  await expectNoHorizontalOverflow(page);
  await expectNoSeriousAxeViolations(page);
});
