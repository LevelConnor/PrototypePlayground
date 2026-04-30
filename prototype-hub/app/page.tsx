'use client';

import { useState, FormEvent } from 'react';

const TOOLS = [
  'Claude',
  'Figma Make',
  'ChatGPT',
  'Lovable',
  'v0',
  'Bolt',
  'Replit',
  'Other',
];

const TIERS = [
  { value: 'Sketch', desc: 'Rough exploration. Lives wherever it was born.' },
  { value: 'Shareable', desc: 'Worth sending to a stakeholder.' },
  { value: 'Reference', desc: 'Will be used in demos or design reviews.' },
];

const AUDIENCES = [
  'Internal',
  'Districts',
  'Counselors',
  'Students',
  'Investors',
  'Public',
];

type Result = {
  liveUrl: string;
  notionUrl: string;
  notionError: string | null;
  deployingMessage: string;
};

export default function SubmitPage() {
  const [title, setTitle] = useState('');
  const [questionExplored, setQuestionExplored] = useState('');
  const [code, setCode] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [tool, setTool] = useState('Claude');
  const [tier, setTier] = useState('Shareable');
  const [audience, setAudience] = useState<string[]>(['Internal']);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function toggleAudience(a: string) {
    setAudience((cur) =>
      cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a],
    );
  }

  function reset() {
    setTitle('');
    setQuestionExplored('');
    setCode('');
    setTier('Shareable');
    setAudience(['Internal']);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          questionExplored,
          code,
          ownerEmail,
          tool,
          tier,
          audience,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed');
        setSubmitting(false);
        return;
      }
      setResult({
        liveUrl: data.liveUrl,
        notionUrl: data.notionUrl,
        notionError: data.notionError,
        deployingMessage: data.deployingMessage,
      });
      setSubmitting(false);
    } catch {
      setError('Network error — try again');
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <main className="page">
        <div className="page__inner">
          <header className="masthead">
            <p className="masthead__eyebrow">Prototype Hub</p>
            <h1 className="masthead__title">Submitted.</h1>
            <p className="masthead__subtitle">
              Your prototype has been committed and Vercel is deploying.
            </p>
          </header>

          <div className="notice notice--success">
            <p className="notice__title">Live link</p>
            <p>{result.deployingMessage}</p>
            <a
              className="notice__url"
              href={result.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.liveUrl}
            </a>
          </div>

          {result.notionUrl && (
            <div className="notice" style={{ marginTop: 16 }}>
              <p className="notice__title">Hub entry</p>
              <p>Added to the Prototype Hub database in Notion.</p>
              <a
                className="notice__url"
                href={result.notionUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Notion ↗
              </a>
            </div>
          )}

          {result.notionError && (
            <div className="notice notice--error" style={{ marginTop: 16 }}>
              <p className="notice__title">Notion sync failed</p>
              <p>
                The prototype is live, but we couldn&rsquo;t add it to the hub
                database. Add it manually with the live link above.
              </p>
              <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                {result.notionError}
              </p>
            </div>
          )}

          <div className="actions" style={{ marginTop: 32 }}>
            <button className="button button--primary" onClick={reset}>
              Submit another
            </button>
          </div>

          <p className="footnote">
            Reminder: it takes 30 to 90 seconds for the link to go live while
            Vercel deploys. If you click too soon, give it another minute.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__inner">
        <header className="masthead">
          <p className="masthead__eyebrow">Prototype Hub · LevelAll</p>
          <h1 className="masthead__title">Publish a prototype.</h1>
          <p className="masthead__subtitle">
            Paste your code, fill in a few details, get a shareable link.
          </p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="title">
              Title <span className="field__required">*</span>
            </label>
            <p className="field__hint">
              A short, memorable name. Becomes part of the URL.
            </p>
            <input
              id="title"
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Live college match feedback"
              maxLength={120}
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="question">
              Question explored <span className="field__required">*</span>
            </label>
            <p className="field__hint">
              One sentence. What is this prototype trying to figure out?
            </p>
            <input
              id="question"
              type="text"
              className="input"
              value={questionExplored}
              onChange={(e) => setQuestionExplored(e.target.value)}
              placeholder="What would a student see if their matches updated as they edit their profile?"
              maxLength={500}
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="code">
              Code <span className="field__required">*</span>
            </label>
            <p className="field__hint">
              Paste full HTML, or just a fragment — we&rsquo;ll wrap it. CDN
              imports work; multi-file React projects don&rsquo;t.
            </p>
            <textarea
              id="code"
              className="textarea textarea--code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="<!DOCTYPE html>&#10;<html>&#10;  ..."
              spellCheck={false}
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="email">
              Your email <span className="field__required">*</span>
            </label>
            <p className="field__hint">
              So teammates know who to ask about this prototype.
            </p>
            <input
              id="email"
              type="email"
              className="input"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="you@levelall.com"
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="tool">
              Tool used
            </label>
            <select
              id="tool"
              className="select"
              value={tool}
              onChange={(e) => setTool(e.target.value)}
            >
              {TOOLS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="tier">
              Tier
            </label>
            <p className="field__hint">
              {TIERS.find((t) => t.value === tier)?.desc}
            </p>
            <select
              id="tier"
              className="select"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.value}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label">Audience</label>
            <p className="field__hint">Who is this prototype for?</p>
            <div className="checkboxes">
              {AUDIENCES.map((a) => (
                <label
                  key={a}
                  className={`checkbox ${audience.includes(a) ? 'checkbox--checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={audience.includes(a)}
                    onChange={() => toggleAudience(a)}
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>

          {error && <div className="notice notice--error">{error}</div>}

          <div className="actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={submitting}
            >
              {submitting ? 'Publishing…' : 'Publish prototype'}
            </button>
          </div>
        </form>

        <p className="footnote">
          Submissions commit to GitHub and trigger a Vercel deploy. The live
          link appears within a minute, and a row is added to the Notion hub
          automatically.
        </p>
      </div>
    </main>
  );
}
