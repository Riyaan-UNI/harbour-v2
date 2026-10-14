import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it('joins API requests to a configured origin and preserves query strings', async () => {
  vi.stubEnv('VITE_API_URL', 'https://api.example.invalid/');
  vi.resetModules();
  const { apiUrl } = await import('./api-base');

  expect(apiUrl('/api/chat?topic=arrival')).toBe(
    'https://api.example.invalid/api/chat?topic=arrival',
  );
  expect(apiUrl('/art/arrival-storm.webp')).toBe('/art/arrival-storm.webp');
});

it('keeps development API calls relative for the Vite proxy', async () => {
  vi.stubEnv('VITE_API_URL', '');
  vi.stubEnv('PROD', false);
  vi.resetModules();
  const { apiUrl } = await import('./api-base');

  expect(apiUrl('/api/chat?topic=arrival')).toBe('/api/chat?topic=arrival');
});

it('rejects production API requests when no backend origin is configured', async () => {
  vi.stubEnv('VITE_API_URL', '');
  vi.stubEnv('PROD', true);
  vi.resetModules();
  const { apiUrl } = await import('./api-base');

  expect(() => apiUrl('/api/chat')).toThrow(/VITE_API_URL/);
  expect(apiUrl('/flags/hk.svg')).toBe('/flags/hk.svg');
});
