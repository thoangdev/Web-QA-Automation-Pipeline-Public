import { test, expect } from '@playwright/test';
import { SauceDemoApi } from '../../src/api/SauceDemoApi';

/**
 * Contract tests verify the response shape and SLOs of an endpoint — not the
 * business logic, which belongs in unit tests. zod parses the response and any
 * schema drift fails the test with a precise error.
 */
test.describe('Homepage contract @api', () => {
  test('returns HTML, contains Swag Labs, under 3s @api', async ({ request }) => {
    const api = new SauceDemoApi(request);
    const res = await api.getHomepage();

    expect(res.status).toBe(200);
    expect(res.contentType).toContain('text/html');
    expect(res.containsSwagLabs).toBe(true);

    // Response-time budget — fail loud when staging gets slow.
    expect.soft(res.durationMs, 'homepage response time').toBeLessThan(3000);
  });
});
