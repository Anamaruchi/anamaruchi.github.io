const ALLOWED_ORIGINS = ['https://anamaruchi.web.id', 'https://anamaruchi.pages.dev'];
const TTL_MS = 3 * 60 * 60 * 1000;
const MAX_FILE_BYTES = 200 * 1024 * 1024;
const MAX_ACTIVE_FILES = 100;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

function wibTime(ms = Date.now()) {
  return new Date(ms + WIB_OFFSET_MS).toISOString().slice(0, 19).replace('T', ' ');
}

function cors(request) {
  const origin = request.headers.get('Origin');
  const h = {};
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Vary'] = 'Origin';
  }
  return h;
}

async function cleanupExpired(env, limit = 50) {
  while (true) {
    const { results } = await env.DB.prepare(
      "SELECT id, file_key FROM booklets WHERE expires_at IS NULL OR expires_at < ? LIMIT ?"
    ).bind(wibTime(), limit).all();
    if (!results || !results.length) return;

    await env.BUCKET.delete(results.map(r => r.file_key));
    await env.DB.batch(
      results.map(r => env.DB.prepare("DELETE FROM booklets WHERE id = ?").bind(r.id))
    );
  }
}

async function enforceFileLimit(env, max = MAX_ACTIVE_FILES) {
  const countRow = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM booklets"
  ).first();
  const total = countRow ? countRow.c : 0;
  if (total < max) return;
  const excess = total - (max - 1);

  const { results } = await env.DB.prepare(
    "SELECT id, file_key FROM booklets ORDER BY expires_at ASC LIMIT ?"
  ).bind(excess).all();
  if (!results || !results.length) return;

  await env.BUCKET.delete(results.map(r => r.file_key));
  await env.DB.batch(
    results.map(r => env.DB.prepare("DELETE FROM booklets WHERE id = ?").bind(r.id))
  );
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

  const formData = await request.formData();
  const file = formData.get('file');
  const size = formData.get('size') || 'a4';
  const orientation = formData.get('orientation') || 'portrait';

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'File PDF wajib diunggah' }, { status: 400, headers });
  }

  if (file.size > MAX_FILE_BYTES) {
    return Response.json({ error: 'File terlalu besar (maks 200 MB)' }, { status: 413, headers });
  }

  const id = Math.random().toString(36).substring(2, 10);
  const fileKey = `booklets/${id}.pdf`;
  const nowMs = Date.now();
  const createdAt = wibTime(nowMs);
  const expiresAt = wibTime(nowMs + TTL_MS);

  await env.BUCKET.put(fileKey, file.stream(), {
    httpMetadata: { contentType: 'application/pdf' }
  });

  await env.DB.prepare(
    "INSERT INTO booklets (id, file_key, size, orientation, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, fileKey, size, orientation, createdAt, expiresAt).run();

  try {
    await cleanupExpired(env);
    await enforceFileLimit(env);
  } catch (e) {
    console.error('file limit cleanup failed', e);
  }

  return Response.json({ success: true, id, expiresAt }, { headers });
}