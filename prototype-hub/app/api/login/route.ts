import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  checkPassword,
  deriveToken,
} from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const password = body?.password;
  if (typeof password !== 'string' || !password) {
    return NextResponse.json(
      { error: 'Password required' },
      { status: 400 },
    );
  }

  if (!checkPassword(password)) {
    return NextResponse.json(
      { error: 'Incorrect password' },
      { status: 401 },
    );
  }

  const token = deriveToken(password);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
