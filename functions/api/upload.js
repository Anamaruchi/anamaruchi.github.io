const ALLOWED_ORIGINS = ['https://anamaruchi.web.id', 'https://anamaruchi.pages.dev'];

const TTL_MS = 3 * 60 * 60 * 1000;
const MAX_FILE_BYTES = 100 * 1024 * 1024; 
const MIN_FILE_BYTES = 64;
const MAX_ACTIVE_FILES = 100;             
const MAX_ACTIVE_PER_IP = 10;             
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const BASE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

function wibTime(ms = Date.now()) {
  return new Date(ms + WIB_OFFSET_MS).toISOString().slice(0, 19).replace('T', ' ');
}

function json(body, status, extra) {
  return Response.json(body, { status, headers: { ...BASE_HEADERS, ...extra } });
}

function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try { return origin === new URL(request.url).origin; } catch { return false; }
}

function cors(request) {
  const origin = request.headers.get('Origin');
  const h = {};
  if (origin && isAllowedOrigin(request)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Vary'] = 'Origin';
  }
  return h;
}

function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function ipKey(ip) {
  if (!ip.includes(':') || ip.includes('.')) return ip;
  const [head, tail = ''] = ip.split('::');
  const h = head ? head.split(':') : [];
  const t = tail ? tail.split(':') : [];
  const full = ip.includes('::')
    ? [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t]
    : h;
  return full.slice(0, 4).join(':');
}

async function hashIp(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const data = new TextEncoder().encode(`${env.IP_HASH_SALT || 'anamaruchi'}|${ipKey(ip)}`);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return [...digest.slice(0, 16)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const NUM = '(\\d{1,3}(?:\\.\\d{1,10})?)';
const CUSTOM_RE = new RegExp(`^custom:${NUM}x${NUM}$`);

function parseSpec(sizeRaw, orientationRaw) {
  const size = String(sizeRaw || 'a4').toLowerCase();
  const orientation = String(orientationRaw || 'portrait').toLowerCase();
  if (orientation !== 'portrait' && orientation !== 'landscape') return null;
  if (size === 'a4' || size === 'a5') return { size, orientation };
  const m = CUSTOM_RE.exec(size);
  if (m) {
    const w = Number(m[1]), h = Number(m[2]);
    if (w > 0 && h > 0 && w <= 500 && h <= 500) return { size: `custom:${m[1]}x${m[2]}`, orientation };
  }
  return null;
}

async function cleanupExpired(env, nowStr, limit = 50, rounds = 3) {
  for (let i = 0; i < rounds; i++) {
    const { results } = await env.DB.prepare(
      "SELECT id, file_key FROM booklets WHERE expires_at IS NULL OR expires_at < ? LIMIT ?"
    ).bind(nowStr, limit).all();
    if (!results || !results.length) return;

    await env.BUCKET.delete(results.map(r => r.file_key));
    await env.DB.batch(
      results.map(r => env.DB.prepare("DELETE FROM booklets WHERE id = ?").bind(r.id))
    );
    if (results.length < limit) return;
  }
}

export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: {
      ...cors(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = cors(request);

  if (!isAllowedOrigin(request)) {
    return json({ error: 'Origin tidak diizinkan' }, 403, headers);
  }

  const contentType = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/pdf') {
    return json({ error: 'Content-Type harus application/pdf' }, 415, headers);
  }

  const length = Number(request.headers.get('Content-Length'));
  if (!Number.isFinite(length) || length <= 0) {
    return json({ error: 'Content-Length wajib ada' }, 411, headers);
  }
  if (length > MAX_FILE_BYTES) {
    return json({ error: 'File terlalu besar (maks 100 MB)' }, 413, headers);
  }
  if (length < MIN_FILE_BYTES || !request.body) {
    return json({ error: 'File PDF tidak valid' }, 400, headers);
  }

  const url = new URL(request.url);
  const spec = parseSpec(url.searchParams.get('size'), url.searchParams.get('orientation'));
  if (!spec) {
    return json({ error: 'Parameter size/orientation tidak valid' }, 400, headers);
  }

  let fileKey = null;
  let stored = false;

  try {
    const nowStr = wibTime();

    const total = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM booklets WHERE expires_at >= ?"
    ).bind(nowStr).first();
    if ((total ? total.c : 0) >= MAX_ACTIVE_FILES) {
      context.waitUntil(cleanupExpired(env, nowStr).catch(e => console.error('cleanup failed', e)));
      return json({ error: 'Server sedang penuh, coba lagi beberapa menit lagi' }, 503, { ...headers, 'Retry-After': '300' });
    }

    const ipHash = await hashIp(request, env);
    const mine = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM booklets WHERE ip_hash = ? AND expires_at >= ?"
    ).bind(ipHash, nowStr).first();
    if ((mine ? mine.c : 0) >= MAX_ACTIVE_PER_IP) {
      return json({ error: 'Terlalu banyak link aktif dari jaringan kamu, tunggu sampai ada yang kedaluwarsa' }, 429, { ...headers, 'Retry-After': '600' });
    }

    const id = newId();
    fileKey = `booklets/${id}.pdf`;

    const obj = await env.BUCKET.put(fileKey, request.body, {
      httpMetadata: { contentType: 'application/pdf' }
    });
    stored = true;

    if (!obj || obj.size > MAX_FILE_BYTES || obj.size < MIN_FILE_BYTES) {
      throw Object.assign(new Error('bad size'), { status: 400, publicMsg: 'File PDF tidak valid' });
    }

    const head = await env.BUCKET.get(fileKey, { range: { offset: 0, length: 5 } });
    const magic = head ? await head.text() : '';
    if (magic !== '%PDF-') {
      throw Object.assign(new Error('not a pdf'), { status: 415, publicMsg: 'File bukan PDF yang valid' });
    }

    const createdMs = Date.now();
    const expiresMs = createdMs + TTL_MS;
    await env.DB.prepare(
      "INSERT INTO booklets (id, file_key, size, orientation, created_at, expires_at, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, fileKey, spec.size, spec.orientation, wibTime(createdMs), wibTime(expiresMs), ipHash).run();

    context.waitUntil(cleanupExpired(env, nowStr).catch(e => console.error('cleanup failed', e)));

    return json({ success: true, id, expiresAt: wibTime(expiresMs), expiresAtMs: expiresMs }, 200, headers);
  } catch (e) {
    if (stored && fileKey) {
      context.waitUntil(env.BUCKET.delete(fileKey).catch(() => {}));
    }
    if (e && e.publicMsg) return json({ error: e.publicMsg }, e.status || 400, headers);
    console.error('upload failed', e);
    return json({ error: 'Upload gagal, coba lagi' }, 500, headers);
  }
}
