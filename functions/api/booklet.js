export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'ID tidak ditemukan' }, { status: 400 });
  }

  // 1. Cari data di D1
  const record = await env.DB.prepare("SELECT * FROM booklets WHERE id = ?").bind(id).first();
  if (!record) {
    return Response.json({ error: 'Booklet tidak ditemukan' }, { status: 404 });
  }

  // 2. Ambil file PDF dari R2
  const pdfObject = await env.BUCKET.get(record.file_key);
  if (!pdfObject) {
    return Response.json({ error: 'File PDF hilang' }, { status: 404 });
  }

  // Return file PDF sebagai ArrayBuffer / Binary Response
  const headers = new Headers();
  pdfObject.writeHttpMetadata(headers);
  headers.set('etag', pdfObject.httpEtag);
  headers.set('Content-Type', 'application/pdf');

  return new Response(pdfObject.body, { headers });
}