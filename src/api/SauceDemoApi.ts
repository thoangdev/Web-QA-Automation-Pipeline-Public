import { APIRequestContext } from '@playwright/test';
import { z } from 'zod';

/**
 * Thin API wrapper — exists to document the pattern for contract testing.
 *
 * Real apps: wrap each endpoint in one method, define a zod schema for the
 * response, and return the parsed result. Tests then assert on shape + values
 * instead of doing raw .json() + manual property checks.
 *
 * Saucedemo has no public JSON API, so this wrapper hits the HTML root and
 * validates the response envelope (status, content-type, body fingerprint).
 */

export const HomepageResponseSchema = z.object({
  status: z.number(),
  contentType: z.string(),
  containsSwagLabs: z.boolean(),
  durationMs: z.number(),
});

export type HomepageResponse = z.infer<typeof HomepageResponseSchema>;

export class SauceDemoApi {
  constructor(private readonly request: APIRequestContext) {}

  async getHomepage(): Promise<HomepageResponse> {
    const start = Date.now();
    const res = await this.request.get('/');
    const body = await res.text();
    const durationMs = Date.now() - start;

    return HomepageResponseSchema.parse({
      status: res.status(),
      contentType: res.headers()['content-type'] ?? '',
      containsSwagLabs: body.includes('Swag Labs'),
      durationMs,
    });
  }
}
