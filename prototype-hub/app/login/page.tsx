'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Sign-in failed');
        setSubmitting(false);
        return;
      }
      const redirect = params.get('redirect') || '/';
      router.push(redirect);
      router.refresh();
    } catch {
      setError('Network error — try again');
      setSubmitting(false);
    }
  }

  return (
    <main className="login">
      <div className="login__card">
        <h1 className="login__title">Prototype Hub</h1>
        <p className="login__subtitle">Sign in to publish a prototype.</p>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="notice notice--error">{error}</div>}

          <button
            type="submit"
            className="button"
            disabled={submitting || !password}
            style={{ marginTop: 8 }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
