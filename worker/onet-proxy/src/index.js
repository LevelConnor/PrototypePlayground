// O*NET Web Services v2 proxy.
// - Holds the X-API-Key as a Worker secret (ONET_API_KEY).
// - Restricts CORS and request origin to approved domains.
// - Caches O*NET responses on the Cloudflare edge for 1h.
//
// Endpoints (all return JSON from O*NET as-is):
//   GET /search?keyword=...&start=1&end=20     -> /online/search
//   GET /career/{code}                          -> /mnm/careers/{code}/
//   GET /career/{code}/outlook                  -> /mnm/careers/{code}/job_outlook
//   GET /career/{code}/details/{slice}          -> /online/occupations/{code}/details/{slice}
//        slice ∈ { tasks, skills, knowledge, work_activities, abilities,
//                  interests, work_context, job_zone, education, related_occupations }
//   GET /bright_outlook/{category}?start=1&end=20  -> /mnm/bright_outlook/{category}
//        category ∈ { grow, openings, emerging }
//   GET /career_cluster/{code}?start=1&end=20   -> /mnm/career_clusters/{code}
//        code is a 6-digit O*NET career-cluster code (e.g. 010100)
//   GET /holland/{code}?start=1&end=20          -> /online/onet_data/interests/{code}
//        code is a 1-3 letter Holland code (e.g. S, SI, SIR)

const ONET_BASE = 'https://api-v2.onetcenter.org';

// Origins allowed to call this Worker. Browsers send Origin; non-browser callers
// (curl, scripts) usually don't, so they get blocked by isAllowedRequest.
// Note: Origin/Referer can be spoofed. This is abuse-deterrence, not a hard
// security boundary — add Cloudflare Rate Limiting Rules for stronger protection.
const EXACT_ORIGINS = new Set([
  'https://levelconnor.github.io',
  'https://www.levelall.com',
  'https://levelall.com',
]);
const ORIGIN_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.webflow\.io$/i, // Webflow staging/preview
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (EXACT_ORIGINS.has(origin)) return true;
  return ORIGIN_PATTERNS.some(rx => rx.test(origin));
}

function isAllowedRequest(request) {
  const origin = request.headers.get('Origin');
  if (origin) return isAllowedOrigin(origin);
  // Fall back to Referer (e.g. some preflighted GETs from iframes omit Origin)
  const referer = request.headers.get('Referer');
  if (referer) {
    try { return isAllowedOrigin(new URL(referer).origin); } catch { return false; }
  }
  return false;
}

const CAREER_CODE_RE = /^[0-9]{2}-[0-9]{4}\.[0-9]{2}$/;
const ALLOWED_DETAIL_SLICES = new Set([
  'tasks', 'skills', 'knowledge', 'work_activities', 'abilities',
  'interests', 'work_context', 'job_zone', 'education', 'related_occupations',
]);
const ALLOWED_BRIGHT_OUTLOOK_CATEGORIES = new Set(['grow', 'openings', 'emerging']);
const CLUSTER_CODE_RE = /^[0-9]{6}$/;
const HOLLAND_CODE_RE = /^[RIASEC]{1,3}$/;

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allow = isAllowedOrigin(origin) ? origin : 'null';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

async function onetFetch(path, env) {
  return fetch(`${ONET_BASE}${path}`, {
    headers: {
      'X-API-Key': env.ONET_API_KEY,
      'Accept': 'application/json',
      'User-Agent': 'PrototypePlayground/1.0 (career-explorer)',
    },
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
}

function jsonResponse(request, body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=3600',
      ...corsHeaders(request),
    },
  });
}

export default {
  async fetch(request, env) {
    // CORS preflight — answer based on Origin but don't gate it (browser handles).
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    // Gate everything else on Origin/Referer.
    if (!isAllowedRequest(request)) {
      return jsonResponse(request, { error: 'Forbidden' }, 403);
    }

    if (request.method !== 'GET') {
      return jsonResponse(request, { error: 'Method not allowed' }, 405);
    }

    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    let onetPath;

    if (parts.length === 0) {
      return new Response(
        'O*NET v2 proxy. Endpoints:\n' +
        '  GET /search?keyword=...&start=1&end=20\n' +
        '  GET /career/{code}\n' +
        '  GET /career/{code}/outlook\n' +
        '  GET /career/{code}/details/{slice}\n',
        { headers: { 'Content-Type': 'text/plain', ...corsHeaders(request) } }
      );
    }

    if (parts[0] === 'search' && parts.length === 1) {
      const keyword = (url.searchParams.get('keyword') || '').trim();
      if (!keyword) return jsonResponse(request, { error: 'Missing keyword' }, 400);
      const start = url.searchParams.get('start') || '1';
      const end = url.searchParams.get('end') || '20';
      onetPath = `/online/search?keyword=${encodeURIComponent(keyword)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    } else if (parts[0] === 'holland' && parts.length === 2 && HOLLAND_CODE_RE.test(parts[1])) {
      const start = url.searchParams.get('start') || '1';
      const end = url.searchParams.get('end') || '20';
      onetPath = `/online/onet_data/interests/${parts[1]}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    } else if (parts[0] === 'career_cluster' && parts.length === 2 && CLUSTER_CODE_RE.test(parts[1])) {
      const start = url.searchParams.get('start') || '1';
      const end = url.searchParams.get('end') || '20';
      onetPath = `/mnm/career_clusters/${parts[1]}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    } else if (parts[0] === 'bright_outlook' && parts.length === 2 && ALLOWED_BRIGHT_OUTLOOK_CATEGORIES.has(parts[1])) {
      const start = url.searchParams.get('start') || '1';
      const end = url.searchParams.get('end') || '20';
      onetPath = `/mnm/bright_outlook/${parts[1]}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    } else if (parts[0] === 'career' && parts[1] && CAREER_CODE_RE.test(parts[1])) {
      const code = parts[1];
      if (parts.length === 2) {
        onetPath = `/mnm/careers/${code}/`;
      } else if (parts.length === 3 && parts[2] === 'outlook') {
        onetPath = `/mnm/careers/${code}/job_outlook`;
      } else if (parts.length === 4 && parts[2] === 'details' && ALLOWED_DETAIL_SLICES.has(parts[3])) {
        onetPath = `/online/occupations/${code}/details/${parts[3]}`;
      } else {
        return jsonResponse(request, { error: 'Not found' }, 404);
      }
    } else {
      return jsonResponse(request, { error: 'Not found' }, 404);
    }

    try {
      const res = await onetFetch(onetPath, env);
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          'Content-Type': res.headers.get('Content-Type') || 'application/json',
          'Cache-Control': res.ok ? 'private, max-age=3600' : 'no-store',
          ...corsHeaders(request),
        },
      });
    } catch (err) {
      return jsonResponse(request, { error: 'Upstream fetch failed', detail: err.message }, 502);
    }
  },
};
