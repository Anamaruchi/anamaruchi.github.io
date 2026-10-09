const ALLOWED_ORIGINS = ['https://anamaruchi.web.id', 'https://anamaruchi.pages.dev'];
const ID_RE = /^[A-Za-z0-9_-]{6,64}$/;          
const SAFE_HEADER_RE = /^[A-Za-z0-9:._-]{1,40}$/;

const BASE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

function wibToMs(str) {
  const ms = Date.parse(String(str).replace(' ', 'T') + '+07:00');
  return Number.isFinite(ms) ? ms : null;
}

function cors(request) {
  const origin = request.headers.get('Origin');
  const h = {};
  let same = false;
  try { same = origin === new URL(request.url).origin; } catch {}
  if (origin && (ALLOWED_ORIGINS.includes(origin) || same)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Vary'] = 'Origin';
    h['Access-Control-Expose-Headers'] = 'X-Booklet-Size, X-Booklet-Orientation, X-Booklet-Expires';
  }
  return h;
}

function json(body, status, extra) {
  return Response.json(body, { status, headers: { ...BASE_HEADERS, ...extra } });
}


function safeHeader(value, fallback) {
  return typeof value === 'string' && SAFE_HEADER_RE.test(value) ? value : fallback;
}

export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: {
      ...cors(request),
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const base = cors(request);

  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return json({ error: 'ID tidak ditemukan' }, 400, base);
    if (!ID_RE.test(id)) return json({ error: 'ID tidak valid' }, 400, base);

    const record = await env.DB.prepare("SELECT * FROM booklets WHERE id = ?").bind(id).first();
    if (!record) return json({ error: 'Booklet tidak ditemukan' }, 404, base);

    const expiresMs = record.expires_at ? wibToMs(record.expires_at) : null;

    if (!expiresMs || expiresMs <= Date.now()) {
      context.waitUntil((async () => {
        await env.BUCKET.delete(record.file_key);
        await env.DB.prepare("DELETE FROM booklets WHERE id = ?").bind(id).run();
      })().catch(e => console.error('expire cleanup failed', e)));
      return json({ error: 'Link sudah kedaluwarsa (berlaku 3 jam)' }, 410, base);
    }

    const pdfObject = await env.BUCKET.get(record.file_key);
    if (!pdfObject) {
      context.waitUntil(
        env.DB.prepare("DELETE FROM booklets WHERE id = ?").bind(id).run().catch(() => {})
      );
      return json({ error: 'File PDF hilang' }, 404, base);
    }

    const headers = new Headers(base);
    pdfObject.writeHttpMetadata(headers);
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'attachment; filename="booklet.pdf"');
    headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
    headers.set('Cache-Control', 'private, no-store');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Robots-Tag', 'noindex');
    headers.set('X-Booklet-Size', safeHeader(record.size, 'a4'));
    headers.set('X-Booklet-Orientation', safeHeader(record.orientation, 'portrait'));
    headers.set('X-Booklet-Expires', String(expiresMs));

    return new Response(pdfObject.body, { headers });
  } catch (e) {
    console.error('booklet fetch failed', e);
    return json({ error: 'Terjadi kesalahan server' }, 500, base);
  }
}
