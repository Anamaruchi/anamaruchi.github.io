const ALLOWED_ORIGINS = ['https://anamaruchi.web.id', 'https://anamaruchi.pages.dev'];

function cors(request) {
  const origin = request.headers.get('Origin');
  const h = {};
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Vary'] = 'Origin';
    h['Access-Control-Expose-Headers'] = 'X-Booklet-Size, X-Booklet-Orientation';
  }
  return h;
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
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const base = cors(request);

  if (!id) {
    return Response.json({ error: 'ID tidak ditemukan' }, { status: 400, headers: base });
  }

  const record = await env.DB.prepare("SELECT * FROM booklets WHERE id = ?").bind(id).first();
  if (!record) {
    return Response.json({ error: 'Booklet tidak ditemukan' }, { status: 404, headers: base });
  }

  if (!record.expires_at || record.expires_at < Date.now()) {
    context.waitUntil((async () => {
      await env.BUCKET.delete(record.file_key);
      await env.DB.prepare("DELETE FROM booklets WHERE id = ?").bind(id).run();
    })().catch(e => console.error('expire cleanup failed', e)));
    return Response.json({ error: 'Link sudah kedaluwarsa (berlaku 6 jam)' }, { status: 410, headers: base });
  }

  const pdfObject = await env.BUCKET.get(record.file_key);
  if (!pdfObject) {
    return Response.json({ error: 'File PDF hilang' }, { status: 404, headers: base });
  }

  const headers = new Headers(base);
  pdfObject.writeHttpMetadata(headers);
  headers.set('etag', pdfObject.httpEtag);
  headers.set('Content-Type', 'application/pdf');
  headers.set('X-Booklet-Size', record.size || 'a4');
  headers.set('X-Booklet-Orientation', record.orientation || 'portrait');

  return new Response(pdfObject.body, { headers });
}