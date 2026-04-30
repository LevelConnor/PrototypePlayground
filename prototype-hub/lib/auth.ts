import crypto from 'crypto';

/**
 * Single shared password auth.
 *
 * On login: we hash the password with the AUTH_SECRET to produce a token.
 * The token (not the password) is stored in an httpOnly cookie.
 * On every request: we re-derive the expected token and compare.
 *
 * As long as AUTH_SECRET stays secret, this is a fine model for an
 * internal tool with one shared password.
 */

const COOKIE_NAME = 'ph_auth';

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET env var is missing or too short');
  }
  return secret;
}

function getPassword(): string {
  const password = process.env.SUBMIT_PASSWORD;
  if (!password) {
    throw new Error('SUBMIT_PASSWORD env var is missing');
  }
  return password;
}

export function deriveToken(password: string): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(password)
    .digest('hex');
}

export function checkPassword(submitted: string): boolean {
  const expected = getPassword();
  // timing-safe equal requires equal-length buffers
  if (submitted.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(submitted),
    Buffer.from(expected),
  );
}

export function checkToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = deriveToken(getPassword());
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
