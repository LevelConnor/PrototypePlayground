import { Client } from '@notionhq/client';

/**
 * Creates a new page (row) in the Prototype Hub Notion database.
 *
 * Property names here MUST match the property names in your Notion
 * database exactly (case-sensitive). If you renamed any properties
 * when setting up the database, update this file accordingly.
 */

export type PrototypeSubmission = {
  title: string;
  questionExplored: string;
  liveUrl: string;
  tool: string;
  tier: 'Sketch' | 'Shareable' | 'Reference';
  audience: string[];
  ownerEmail: string;
};

function getClient(): Client {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN env var is missing');
  return new Client({ auth: token });
}

function getDatabaseId(): string {
  const id = process.env.NOTION_DATABASE_ID;
  if (!id) throw new Error('NOTION_DATABASE_ID env var is missing');
  return id;
}

export async function createHubEntry(
  submission: PrototypeSubmission,
): Promise<{ pageUrl: string }> {
  const notion = getClient();
  const databaseId = getDatabaseId();

  const today = new Date().toISOString().slice(0, 10);

  // Default values for fields that aren't on the form but are in the schema
  const linkStability = submission.tool === 'Claude' ? 'Probably stable' : 'Permanent';
  const access = 'Public';
  const status = 'Published';

  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      // Title property — Notion requires exactly one Title-typed prop.
      // Default Notion databases call this "Name"; rename it to "Title"
      // OR change the key here to "Name".
      Title: {
        title: [{ text: { content: submission.title } }],
      },
      'Question explored': {
        rich_text: [{ text: { content: submission.questionExplored } }],
      },
      'Live link': { url: submission.liveUrl },
      Tool: { select: { name: submission.tool } },
      Tier: { select: { name: submission.tier } },
      Status: { select: { name: status } },
      Access: { select: { name: access } },
      'Link stability': { select: { name: linkStability } },
      Audience: {
        multi_select: submission.audience.map((name) => ({ name })),
      },
      // Owner stored as email in a rich_text field. If you set up the
      // hub with a real Person property, swap this for `people: [...]`
      // — but that requires looking up workspace user IDs, which is
      // fiddly. Email-as-text is friction-free for v1.
      'Owner email': {
        rich_text: [{ text: { content: submission.ownerEmail } }],
      },
      Published: { date: { start: today } },
    },
  });

  // The Notion SDK types `url` as optional on the response.
  const pageUrl = 'url' in response && typeof response.url === 'string'
    ? response.url
    : '';

  return { pageUrl };
}
