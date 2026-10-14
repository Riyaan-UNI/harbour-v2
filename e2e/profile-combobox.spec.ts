import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Profile country/university comboboxes + the light-mode mascot fix.
 *
 * Two things are pinned here:
 *
 *   1. **The two dropdowns work end-to-end** — open, filter, pick, save, and
 *      the ledger shows the resolved flag and crest; the choice survives a
 *      reload because it is written in the canonical code/id shape.
 *   2. **The mascot face survives light mode** — before the fix the ink read
 *      `--bg` (near-white in light), so the face vanished on the white plate.
 *      The mascot now inks from `--mascot-ink`, which is dark in both themes.
 *
 * The combobox is `role="combobox"` with a `role="listbox"` popover; the ids
 * come from `useId` and contain colons, so nothing here builds a `#` selector
 * from one — rows are found by role and name.
 */

const PROFILE_PATH = '/app/profile';

const SEED_PROFILE = JSON.stringify({
  name: 'Sam Okonkwo',
  country: '',
  university: '',
  socials: {},
});

async function openProfile(page: Page, theme: 'dark' | 'light'): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(
    ({ mode, profile, profiles, activeId }) => {
      window.localStorage.setItem('harbour:theme', mode);
      window.localStorage.setItem('harbour-profile', profile);
      window.localStorage.setItem('harbour:v1:profiles', profiles);
      window.localStorage.setItem('harbour:v1:activeProfileId', activeId);
    },
    {
      mode: theme,
      profile: SEED_PROFILE,
      profiles: JSON.stringify([
        {
          id: 'p_e2e',
          name: 'Sam Okonkwo',
          country: '',
          university: '',
          socials: {},
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
      activeId: 'p_e2e',
    },
  );
  await page.goto(PROFILE_PATH);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

/** Enter edit mode from the facts ledger. */
async function startEditing(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await expect(page.locator('#profile-country')).toBeVisible();
}

test('country combobox filters, selects, saves and persists', async ({ page }) => {
  await openProfile(page, 'dark');
  await startEditing(page);

  const country = page.locator('#profile-country');
  await country.click();

  // The popover opens with a focused search box.
  const search = page.getByRole('combobox').locator('..').getByRole('textbox');
  await expect(search).toBeVisible();
  await search.fill('taiwan');

  // Filtered to the one match, and it carries the corrected name.
  const option = page.getByRole('option', { name: /Taiwan, China/ });
  await expect(option).toBeVisible();
  await option.click();

  // The trigger now shows the chosen value.
  await expect(country).toContainText('Taiwan, China');

  // Save and read the ledger.
  await page.getByRole('button', { name: /save changes/i }).click();
  const ledger = page.locator('.app-profile-ledger');
  await expect(ledger).toContainText('Taiwan, China');
  await expect(ledger.locator('img.app-profile-flag')).toHaveAttribute(
    'src',
    '/flags/tw.svg',
  );

  // Survives a reload — this is the persisted-code assertion.
  await page.reload();
  await expect(page.locator('.app-profile-ledger')).toContainText('Taiwan, China');
});

test('university combobox filters by acronym and shows the crest', async ({
  page,
}) => {
  await openProfile(page, 'dark');
  await startEditing(page);

  const university = page.locator('#profile-university');
  await university.click();

  const search = page.getByRole('combobox').locator('..').getByRole('textbox');
  await search.fill('hkust');

  const option = page.getByRole('option', {
    name: /Hong Kong University of Science and Technology/,
  });
  await expect(option).toBeVisible();
  await option.click();

  await page.getByRole('button', { name: /save changes/i }).click();

  const ledger = page.locator('.app-profile-ledger');
  await expect(ledger).toContainText('Hong Kong University of Science and Technology');
  await expect(ledger.locator('.app-profile-uni-crest').first()).toBeVisible();
});

test('the two comboboxes are axe-clean when open', async ({ page }) => {
  await openProfile(page, 'dark');
  await startEditing(page);

  await page.locator('#profile-country').click();
  await expect(page.getByRole('option').first()).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(
    blocking.flatMap((violation) =>
      violation.nodes.map((node) => `${violation.id} ${node.target.join(' ')}`),
    ),
  ).toEqual([]);
});

test('mascot ink is dark in both themes so the face stays visible', async ({
  page,
}) => {
  for (const theme of ['dark', 'light'] as const) {
    await openProfile(page, theme);
    await startEditing(page);

    // The picker grid renders all twelve creatures; take the first.
    const creature = page.locator('.app-profile-mascot__creature').first();
    await expect(creature).toBeVisible();

    // The ink token resolves to a dark value in BOTH themes — the whole point
    // of the fix. `--bg` (the old source) would be near-white in light.
    const ink = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--mascot-ink')
        .trim(),
    );
    expect(ink, `${theme} mascot ink`).toBeTruthy();

    const luminance = await page.evaluate((value) => {
      const probe = document.createElement('span');
      probe.style.color = value;
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color.match(/\d+/g) ?? [];
      probe.remove();
      const [r = 0, g = 0, b = 0] = rgb.map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    }, ink);

    // Dark ink in both themes — a relative luminance well under mid-grey.
    expect(luminance, `${theme} ink luminance`).toBeLessThan(0.4);
  }
});
