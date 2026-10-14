import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * End-to-end gate — the `/app/chat` Harbour chat page.
 *
 * The page is the app lane's only multi-turn conversation surface. This spec
 * pins the two things that make it a chat app rather than a form: the frame
 * (a pinned composer and a live status, with the thread as the only scroll
 * region), and the round trip through `POST /api/chat` including its
 * history-aware body, its error path and its retry.
 *
 * `/api/chat` is stubbed with `page.route`, so the spec never touches the
 * Express lane or an upstream model. Coverage, per spec §12: both themes at
 * 320/360/390/768/1024/1440 with no horizontal overflow, axe clean at every
 * width, screenshots at 360 and 1440, and a reduced-motion pass — plus what
 * the page is actually about: sending, suggestion chips as real buttons,
 * grouping, the DEMO badge, and recovery from a failed send.
 */

const CHAT_PATH = '/app/chat';
const THEMES = ['dark', 'light'] as const;
const WIDTHS = [320, 360, 390, 768, 1024, 1440] as const;
const VIEWPORT_HEIGHT = 900;

// Kept out of Playwright's outputDir so the screenshots survive a re-run.
const SCREENSHOT_DIR = 'screenshots';

const HEADLINE = 'No question is too small.';
const CANNED_REPLY =
  'Take the MTR to Central. Buy an Octopus card at any station first.';
const FIRST_SUGGESTION = 'How do I use the MTR?';

type Theme = (typeof THEMES)[number];

/** Seed the device-local profile the app guard reads, then open the page. */
async function openChat(
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
  await page.goto(CHAT_PATH);
  await expect(page).toHaveURL(new RegExp(`${CHAT_PATH}$`));
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(
    page.getByRole('heading', { level: 1, name: HEADLINE }),
  ).toBeVisible();
}

/** Answer `POST /api/chat` with a canned success envelope. */
async function stubChatSuccess(page: Page): Promise<void> {
  await page.route('**/api/chat', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: CANNED_REPLY, demo: true }),
    }),
  );
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
    test(`chat · ${theme} · ${width}px`, async ({ page }) => {
      await stubChatSuccess(page);
      await openChat(page, theme, width);

      await expectNoHorizontalOverflow(page);

      if (SCREENSHOT_WIDTHS.has(width)) {
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/chat-${theme}-${width}.png`,
          fullPage: true,
        });
      }

      await expectNoSeriousAxeViolations(page);
    });
  }
}

test('the composer stays pinned and reachable at the narrowest width', async ({
  page,
}) => {
  await stubChatSuccess(page);
  await openChat(page, 'dark', 320);

  const composer = page.locator('.ask-composer');
  await expect(composer).toBeInViewport();

  // The send button must not be hidden behind the mobile tab bar: a real
  // click has to land on it, which Playwright refuses if it is occluded.
  await page.getByLabel('Your question').fill('Is the MTR safe at night?');
  await page.getByRole('button', { name: 'Ask Harbour' }).click();

  await expect(
    page.getByText(CANNED_REPLY, { exact: false }),
  ).toBeVisible();
});

test('a question round-trips and the reply carries the DEMO badge', async ({
  page,
}) => {
  await stubChatSuccess(page);
  await openChat(page, 'dark', 1440);

  await page.getByLabel('Your question').fill('How do I use the MTR?');
  await page.getByRole('button', { name: 'Ask Harbour' }).click();

  // The user's turn, grouped under a YOU eyebrow.
  await expect(
    page.locator('.ask-group--user .ask-bubble--user'),
  ).toHaveCount(1);

  // Harbour's answer, with the honesty badge and a timestamp.
  await expect(
    page.locator('.ask-group--harbour .ask-bubble--harbour'),
  ).toHaveCount(1);
  await expect(page.getByText(CANNED_REPLY, { exact: false })).toBeVisible();
  await expect(page.locator('.ask-bubble--harbour time')).toHaveCount(1);

  // The DEMO badge prints its own word exactly once — the "demo · DEMO"
  // double label is the bug this asserts against.
  const badge = page.locator('.ask-bubble--harbour').getByText(/demo/i);
  await expect(badge).toHaveCount(1);
});

test('the request carries bounded history on the second turn', async ({
  page,
}) => {
  let lastBody: { message?: string; history?: unknown[] } = {};

  await page.route('**/api/chat', async (route) => {
    lastBody = route.request().postDataJSON() as typeof lastBody;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: CANNED_REPLY, demo: true }),
    });
  });

  await openChat(page, 'dark', 1440);

  const box = page.getByLabel('Your question');

  await box.fill('What is an Octopus card?');
  await page.getByRole('button', { name: 'Ask Harbour' }).click();
  await expect(page.getByText(CANNED_REPLY, { exact: false })).toBeVisible();

  await box.fill('Where can I buy one?');
  await page.getByRole('button', { name: 'Ask Harbour' }).click();
  await expect(page.locator('.ask-bubble--harbour')).toHaveCount(2);

  expect(lastBody.message).toBe('Where can I buy one?');
  expect(Array.isArray(lastBody.history)).toBe(true);
  expect(lastBody.history?.length).toBe(3); // user, harbour, user
});

test('suggestion chips are real buttons and send on click', async ({
  page,
}) => {
  await stubChatSuccess(page);
  await openChat(page, 'dark', 1440);

  const chip = page.getByRole('button', { name: FIRST_SUGGESTION });
  await expect(chip).toBeVisible();
  await chip.click();

  await expect(
    page.locator('.ask-group--user .ask-bubble--user'),
  ).toHaveCount(1);
  await expect(page.getByText(CANNED_REPLY, { exact: false })).toBeVisible();
});

test('a failed send offers a retry that recovers', async ({ page }) => {
  let attempt = 0;

  await page.route('**/api/chat', async (route) => {
    attempt += 1;
    if (attempt === 1) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Harbour guide is temporarily unavailable.',
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: CANNED_REPLY, demo: true }),
    });
  });

  await openChat(page, 'dark', 1440);

  await page.getByLabel('Your question').fill('Can I open a bank account?');
  await page.getByRole('button', { name: 'Ask Harbour' }).click();

  // The offline panel and its retry control.
  await expect(
    page.getByText("Can't reach Harbour right now"),
  ).toBeVisible();
  const retry = page.getByRole('button', { name: 'Try again' });
  await expect(retry).toBeVisible();

  await retry.click();
  await expect(page.getByText(CANNED_REPLY, { exact: false })).toBeVisible();
});

test('starting a new conversation clears the thread', async ({ page }) => {
  await stubChatSuccess(page);
  await openChat(page, 'dark', 1440);

  await page.getByLabel('Your question').fill('Hello Harbour');
  await page.getByRole('button', { name: 'Ask Harbour' }).click();
  await expect(page.locator('.ask-bubble')).toHaveCount(2);

  await page
    .getByRole('button', { name: 'Start a new conversation' })
    .click();

  await expect(page.locator('.ask-bubble')).toHaveCount(0);
  await expect(page.getByRole('button', { name: FIRST_SUGGESTION })).toBeVisible();
});

test('the live status reports readiness', async ({ page }) => {
  await stubChatSuccess(page);
  await openChat(page, 'dark', 1440);

  const status = page.locator('.ask-header__status');
  await expect(status).toHaveAttribute('role', 'status');
  await expect(status).toHaveText(/ready/i);
});

test('reduced motion still renders a clean, overflow-free page', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await stubChatSuccess(page);
  await openChat(page, 'light', 390);

  await page.getByLabel('Your question').fill('Is the tap water safe?');
  await page.getByRole('button', { name: 'Ask Harbour' }).click();
  await expect(page.getByText(CANNED_REPLY, { exact: false })).toBeVisible();

  await expectNoHorizontalOverflow(page);
  await expectNoSeriousAxeViolations(page);
});
