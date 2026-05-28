// O*NET Web Services v2 proxy.
// - Holds the X-API-Key as a Worker secret (ONET_API_KEY).
// - Adds CORS so the browser-side Career Explorer can call it.
// - Caches O*NET responses on the Cloudflare edge for 1h.
//
// Endpoints (all return JSON from O*NET as-is):
//   GET /search?keyword=...&start=1&end=20     -> /online/search
//   GET /career/{code}                          -> /mnm/careers/{code}/
//   GET /career/{code}/outlook                  -> /mnm/careers/{code}/job_outlook
//   GET /career/{code}/details/{slice}          -> /online/occupations/{code}/details/{slice}
//        slice ∈ { tasks, skills, knowledge, work_activities, abilities,
//                  interests, work_context, job_zone, education, related_occupations }

const ONET_BASE = 'https://api-v2.onetcenter.org';
const ALLOWED_ORIGIN = '*';

const CAREER_CODE_RE = /^[0-9]{2}-[0-9]{4}\.[0-9]{2}$/;
const ALLOWED_DETAIL_SLICES = new Set([
  'tasks', 'skills', 'knowledge', 'work_activities', 'abilities',
  'interests', 'work_context', 'job_zone', 'education', 'related_occupations',
]);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
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

function jsonResponse(body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      ...corsHeaders(),
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
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
        { headers: { 'Content-Type': 'text/plain', ...corsHeaders() } }
      );
    }

    if (parts[0] === 'search' && parts.length === 1) {
      const keyword = (url.searchParams.get('keyword') || '').trim();
      if (!keyword) return jsonResponse({ error: 'Missing keyword' }, 400);
      const start = url.searchParams.get('start') || '1';
      const end = url.searchParams.get('end') || '20';
      onetPath = `/online/search?keyword=${encodeURIComponent(keyword)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    } else if (parts[0] === 'career' && parts[1] && CAREER_CODE_RE.test(parts[1])) {
      const code = parts[1];
      if (parts.length === 2) {
        onetPath = `/mnm/careers/${code}/`;
      } else if (parts.length === 3 && parts[2] === 'outlook') {
        onetPath = `/mnm/careers/${code}/job_outlook`;
      } else if (parts.length === 4 && parts[2] === 'details' && ALLOWED_DETAIL_SLICES.has(parts[3])) {
        onetPath = `/online/occupations/${code}/details/${parts[3]}`;
      } else {
        return jsonResponse({ error: 'Not found' }, 404);
      }
    } else {
      return jsonResponse({ error: 'Not found' }, 404);
    }

    try {
      const res = await onetFetch(onetPath, env);
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          'Content-Type': res.headers.get('Content-Type') || 'application/json',
          'Cache-Control': res.ok ? 'public, max-age=3600' : 'no-store',
          ...corsHeaders(),
        },
      });
    } catch (err) {
      return jsonResponse({ error: 'Upstream fetch failed', detail: err.message }, 502);
    }
  },
};
