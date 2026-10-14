import { test, expect } from '@playwright/test';

test('probe: does /app/chat render', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('harbour:theme', 'dark');
    window.localStorage.setItem('harbour-profile', JSON.stringify({ name: 'Sam Okonkwo', country: 'Ghana', university: 'HKU', socials: {} }));
    window.localStorage.setItem('harbour:v1:profiles', JSON.stringify([{ id: 'p_e2e', name: 'Sam Okonkwo', country: 'Ghana', university: 'HKU', socials: {}, createdAt: '2026-01-01T00:00:00.000Z' }]));
    window.localStorage.setItem('harbour:v1:activeProfileId', 'p_e2e');
  });
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto('/app/chat', { waitUntil: 'domcontentloaded' });
  console.log('URL:', page.url());
  console.log('H1:', await page.locator('h1').first().textContent().catch(() => 'none'));
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
});
