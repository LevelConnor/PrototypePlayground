import crypto from 'crypto';

/**
 * Convert a free-form title into a URL-safe slug.
 *
 * Examples:
 *   "Live College Match Feedback"  →  "live-college-match-feedback"
 *   "Q1 2026 — pricing v2!"        →  "q1-2026-pricing-v2"
 *   "  whitespace   chaos  "       →  "whitespace-chaos"
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/^-+|-+$/g, '');

  return base || 'prototype';
}

/**
 * Append a short random suffix on collision. Six hex characters is
 * 16 million possibilities — enough that collisions are practically
 * impossible for an internal tool.
 */
export function withCollisionSuffix(slug: string): string {
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${slug}-${suffix}`;
}
