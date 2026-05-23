import { z } from 'zod';

// ── Schemas ──────────────────────────────────────────────────────────────────

export const JiraTicketSchema = z.object({
  key: z.string(),
  fields: z.object({
    summary: z.string(),
    description: z.union([z.string(), z.null()]).optional(),
    status: z.object({ name: z.string() }),
    issuetype: z.object({ name: z.string() }),
    priority: z.object({ name: z.string() }).optional(),
  }),
});

export const JiraSearchResultSchema = z.object({
  issues: z.array(JiraTicketSchema),
  total: z.number(),
});

export const JiraCreateIssueResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  self: z.string(),
});

export type JiraTicket = z.infer<typeof JiraTicketSchema>;
export type JiraSearchResult = z.infer<typeof JiraSearchResultSchema>;
export type JiraCreateIssueResponse = z.infer<typeof JiraCreateIssueResponseSchema>;

export interface CreateDefectPayload {
  projectKey: string;
  summary: string;
  description: string;
  labels?: string[];
  priority?: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
}

// ── Client ───────────────────────────────────────────────────────────────────

/**
 * Typed Jira REST API wrapper.
 *
 * Use this class when tests need to assert on Jira data (e.g. verify a defect
 * was created). For agent-driven ticket reads and defect creation, prefer the
 * Jira MCP server configured in .mcp.json — it requires no code.
 *
 * Credentials come from env vars: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN.
 */
export class JiraApi {
  private readonly authHeader: string;

  constructor(
    private readonly baseUrl: string,
    email: string,
    apiToken: string,
  ) {
    this.authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`;
  }

  private async request(
    path: string,
    options: RequestInit = {},
  ): Promise<{ data: unknown; status: number }> {
    const res = await fetch(`${this.baseUrl}/rest/api/3${path}`, {
      ...options,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers ?? {}),
      },
    });
    const data = res.status === 204 ? null : await res.json();
    return { data, status: res.status };
  }

  async getTicket(ticketId: string): Promise<JiraTicket> {
    const { data } = await this.request(`/issue/${ticketId}`);
    return JiraTicketSchema.parse(data);
  }

  async searchOpenDefects(testName: string, projectKey: string): Promise<JiraTicket[]> {
    const jql = encodeURIComponent(
      `project="${projectKey}" AND issuetype=Bug AND status NOT IN (Done,Resolved) AND summary~"${testName}" ORDER BY created DESC`,
    );
    const { data } = await this.request(`/search?jql=${jql}&maxResults=5`);
    return JiraSearchResultSchema.parse(data).issues;
  }

  async createDefect(payload: CreateDefectPayload): Promise<JiraCreateIssueResponse> {
    const body = {
      fields: {
        project: { key: payload.projectKey },
        summary: payload.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: payload.description }],
            },
          ],
        },
        issuetype: { name: 'Bug' },
        labels: payload.labels ?? ['automated-qa'],
        ...(payload.priority ? { priority: { name: payload.priority } } : {}),
      },
    };
    const { data } = await this.request('/issue', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return JiraCreateIssueResponseSchema.parse(data);
  }

  async addComment(issueKey: string, comment: string): Promise<void> {
    await this.request(`/issue/${issueKey}/comment`, {
      method: 'POST',
      body: JSON.stringify({
        body: {
          type: 'doc',
          version: 1,
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: comment }] },
          ],
        },
      }),
    });
  }
}
