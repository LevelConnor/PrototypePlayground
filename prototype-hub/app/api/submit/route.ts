import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, checkToken } from '@/lib/auth';
import { generateSlug, withCollisionSuffix } from '@/lib/slug';
import { createFile, pathExists } from '@/lib/github';
import { createHubEntry } from '@/lib/notion';

export const runtime = 'nodejs';

const MAX_CODE_BYTES = 500 * 1024; // 500KB
const ALLOWED_TOOLS = [
  'Claude',
  'Figma Make',
  'ChatGPT',
  'Lovable',
  'v0',
  'Bolt',
  'Replit',
  'Other',
] as const;
const ALLOWED_TIERS = ['Sketch', 'Shareable', 'Reference'] as const;
const ALLOWED_AUDIENCES = [
  'Internal',
  'Districts',
  'Counselors',
  'Students',
  'Investors',
  'Public',
] as const;

type SubmitBody = {
  title?: string;
  questionExplored?: string;
  code?: string;
  ownerEmail?: string;
  tool?: string;
  tier?: string;
  audience?: string[];
};

export async function POST(req: Request) {
  // Auth — middleware already gated this route, but re-verify the token
  // so a forged cookie (without the secret) can't slip through.
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!checkToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ─── Validate ───────────────────────────────────────────────────
  const errors: string[] = [];

  const title = (body.title ?? '').trim();
  if (!title) errors.push('Title is required');
  if (title.length > 120) errors.push('Title must be 120 characters or fewer');

  const questionExplored = (body.questionExplored ?? '').trim();
  if (!questionExplored) errors.push('Question explored is required');
  if (questionExplored.length > 500) {
    errors.push('Question explored must be 500 characters or fewer');
  }

  const code = body.code ?? '';
  if (!code.trim()) errors.push('Code is required');
  if (Buffer.byteLength(code, 'utf-8') > MAX_CODE_BYTES) {
    errors.push(`Code must be ${MAX_CODE_BYTES / 1024}KB or smaller`);
  }

  const ownerEmail = (body.ownerEmail ?? '').trim();
  if (!ownerEmail) errors.push('Owner email is required');
  if (ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    errors.push('Owner email must be a valid email');
  }

  const tool = body.tool ?? '';
  if (!ALLOWED_TOOLS.includes(tool as (typeof ALLOWED_TOOLS)[number])) {
    errors.push('Tool must be one of: ' + ALLOWED_TOOLS.join(', '));
  }

  const tier = body.tier ?? '';
  if (!ALLOWED_TIERS.includes(tier as (typeof ALLOWED_TIERS)[number])) {
    errors.push('Tier must be one of: ' + ALLOWED_TIERS.join(', '));
  }

  const audience = Array.isArray(body.audience) ? body.audience : [];
  for (const a of audience) {
    if (!ALLOWED_AUDIENCES.includes(a as (typeof ALLOWED_AUDIENCES)[number])) {
      errors.push(`Audience "${a}" is not a valid option`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
  }

  // ─── Wrap raw code in a full HTML document if needed ────────────
  // Permissive mode: we trust submitters and don't sanitize. We DO
  // make sure the file is a valid standalone HTML doc — if the user
  // pasted a fragment (e.g. just <div>...</div>), wrap it.
  const isFullDoc = /<!doctype\s+html|<html[\s>]/i.test(code);
  const html = isFullDoc ? code : wrapAsHtmlDoc(title, code);

  // ─── Slug + collision check ─────────────────────────────────────
  let slug = generateSlug(title);
  const path = (s: string) => `public/prototypes/${s}/index.html`;

  if (await pathExists(path(slug))) {
    slug = withCollisionSuffix(slug);
    // Extremely unlikely, but if even the random suffix collides, bail.
    if (await pathExists(path(slug))) {
      return NextResponse.json(
        { error: 'Slug collision — please retry' },
        { status: 409 },
      );
    }
  }

  // ─── Commit to GitHub ───────────────────────────────────────────
  try {
    await createFile({
      path: path(slug),
      content: html,
      commitMessage: `Add prototype: ${title}`,
    });
  } catch (err) {
    console.error('GitHub commit failed:', err);
    return NextResponse.json(
      { error: 'Failed to publish to GitHub' },
      { status: 502 },
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || '';
  const liveUrl = `${baseUrl}/p/${slug}`;

  // ─── Create Notion row ──────────────────────────────────────────
  // We don't fail the whole submission if Notion fails — the prototype
  // is already published. We just surface the error.
  let notionUrl = '';
  let notionError: string | null = null;
  try {
    const result = await createHubEntry({
      title,
      questionExplored,
      liveUrl,
      tool,
      tier: tier as (typeof ALLOWED_TIERS)[number],
      audience,
      ownerEmail,
    });
    notionUrl = result.pageUrl;
  } catch (err) {
    console.error('Notion create failed:', err);
    notionError =
      err instanceof Error ? err.message : 'Unknown Notion error';
  }

  return NextResponse.json({
    ok: true,
    slug,
    liveUrl,
    notionUrl,
    notionError,
    deployingMessage:
      'Your prototype is live in GitHub. Vercel takes 30-90 seconds to deploy.',
  });
}

function wrapAsHtmlDoc(title: string, body: string): string {
  const safeTitle = title.replace(/[<>&"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] || c,
  );
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle}</title>
</head>
<body>
${body}
</body>
</html>
`;
}
