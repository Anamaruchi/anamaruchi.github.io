const ALLOWED_ORIGINS = ['https://anamaruchi.web.id', 'https://anamaruchi.pages.dev'];

function cors(request) {
  const origin = request.headers.get('Origin');
  const h = {};
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Vary'] = 'Origin';
  }
  return h;
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
  const size = formData.get('size') || 'a4';              // 'a4' | 'a5' | 'custom:21x29.7'
  const orientation = formData.get('orientation') || 'portrait';

  if (!file || typeof file === 'string') {
    return Response.json({ error: 'File PDF wajib diunggah' }, { status: 400, headers });
  }

  const id = Math.random().toString(36).substring(2, 10);
  const fileKey = `booklets/${id}.pdf`;

  await env.BUCKET.put(fileKey, file.stream(), {
    httpMetadata: { contentType: 'application/pdf' }
  });

  await env.DB.prepare(
    "INSERT INTO booklets (id, file_key, size, orientation) VALUES (?, ?, ?, ?)"
  ).bind(id, fileKey, size, orientation).run();

  return Response.json({ success: true, id }, { headers });
}