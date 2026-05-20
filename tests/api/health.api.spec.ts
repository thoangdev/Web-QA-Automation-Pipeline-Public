import { test, expect } from '@playwright/test';

test.describe('Site availability @api', () => {
  test('GET / returns a successful response @api', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBeLessThan(400);
    const body = await res.text();
    expect(body).toContain('Swag Labs');
  });

  test('static asset CDN responds @api', async ({ request }) => {
    const res = await request.get('/v1/');
    expect([200, 301, 302, 404]).toContain(res.status());
  });
});
