import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Dev hub end-to-end gate — Brick 3b.
 *
 * The dev hub lists every route, grouped by production and development, with
 * descriptions and brick numbers. It is reachable at `/dev` and linked from
 * every dev page header.
 */

const DEV_HUB_PATH = '/dev';
const THEMES = ['dark', 'light'] as const;

async function openDevHub(page: Page, theme: (typeof THEMES)[number]): Promise<void> {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.addInitScript((mode) => {
    window.localStorage.setItem('harbour:theme', mode);
  }, theme);
  await page.goto(DEV_HUB_PATH);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Routes' }),
  ).toBeVisible();
}

for (const theme of THEMES) {
  test(`dev hub · ${theme} · loads and lists all routes`, async ({ page }) => {
    await openDevHub(page, theme);

    await expect(page.getByRole('heading', { name: 'Production' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Development' })).toBeVisible();

    // Every route from the registry should appear.
    const routes = ['Landing', 'Dev hub', 'Gallery', 'Primitives', 'Components'];
    for (const label of routes) {
      await expect(page.getByRole('heading', { name: label, level: 3 })).toBeVisible();
    }

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(blocking, 'axe reported serious or critical violations').toEqual([]);
  });
}

test('dev hub: clicking a dev route navigates to it', async ({ page }) => {
  await openDevHub(page, 'dark');

  const link = page.getByRole('link', { name: 'Open Gallery' });
  await link.click();

  await expect(page).toHaveURL('/dev/gallery');
  await expect(
    page.getByRole('heading', { name: 'Foundation gallery' }),
  ).toBeVisible();
});

test('dev hub: clicking a production route navigates to it', async ({ page }) => {
  await openDevHub(page, 'dark');

  const link = page.getByRole('link', { name: 'Open Landing' });
  await link.click();

  await expect(page).toHaveURL('/');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Your safe harbour in Hong Kong.',
    }),
  ).toBeVisible();
});

test('dev hub: every dev page header links back to the hub', async ({ page }) => {
  await openDevHub(page, 'dark');

  const devPages = [
    { path: '/dev/gallery', heading: 'Foundation gallery' },
    { path: '/dev/primitives', heading: 'Layout primitives' },
    { path: '/dev/components', heading: 'Shared components' },
  ];

  for (const { path, heading } of devPages) {
    await page.goto(path);
    await expect(
      page.getByRole('heading', { name: heading }),
    ).toBeVisible();

    const backLink = page.getByRole('link', { name: 'Dev hub' });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL('/dev');
  }
});
