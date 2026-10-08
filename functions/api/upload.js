export async function onRequestPost(context) {
  const { request, env } = context;
  const formData = await request.formData();
  const file = formData.get('file');
  const size = formData.get('size') || 'a4';
  const orientation = formData.get('orientation') || 'portrait';

  if (!file) {
    return Response.json({ error: 'File PDF wajib diunggah' }, { status: 400 });
  }

  // Buat ID Unik 8 Karakter
  const id = Math.random().toString(36).substring(2, 10);
  const fileKey = `booklets/${id}.pdf`;

  // 1. Simpan File PDF ke Cloudflare R2
  await env.BUCKET.put(fileKey, file.stream(), {
    httpMetadata: { contentType: 'application/pdf' }
  });

  // 2. Catat metadata ke Cloudflare D1 Database
  await env.DB.prepare(
    "INSERT INTO booklets (id, file_key, size, orientation) VALUES (?, ?, ?, ?)"
  ).bind(id, fileKey, size, orientation).run();

  return Response.json({ success: true, id: id });
}