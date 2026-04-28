import { test, expect } from '@playwright/test';

// Replace these with your app's real API contract tests.
// Playwright's built-in `request` fixture handles REST calls — no extra library needed.

test('GET /api/users returns 200 @api', async ({ request }) => {
  const res  = await request.get('/api/users');
  const body = await res.json();
  expect(res.status()).toBe(200);
  expect(Array.isArray(body.data)).toBe(true);
});

test('POST /api/users rejects missing body @api', async ({ request }) => {
  const res = await request.post('/api/users', { data: {} });
  expect(res.status()).toBeGreaterThanOrEqual(400);
});
