import { NextResponse } from 'next/server'; import { cookies } from 'next/headers'; import { verifySession } from '@/lib/auth'; import fs from 'fs'; import path from 'path';
export async function POST(req: Request) {
  if (!verifySession(cookies().get('spnews_admin')?.value)) return NextResponse.json({ error:'Unauthorized' },{status:401});
  const form = await req.formData(); const file = form.get('file') as File | null; if (!file) return NextResponse.json({ error:'No file' },{status:400});
  const buf = Buffer.from(await file.arrayBuffer());
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try { const { put } = await import('@vercel/blob'); const blob = await put(`uploads/${Date.now()}-${file.name}`, buf, { access:'public', token: process.env.BLOB_READ_WRITE_TOKEN }); return NextResponse.json({ ok:true, url: blob.url, storage:'vercel-blob' }); } catch (e:any) { return NextResponse.json({ error:'Blob upload failed: '+e.message },{status:500}); }
  }
  const dir = path.join(process.cwd(), 'public', 'uploads'); fs.mkdirSync(dir, { recursive:true });
  const name = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`; fs.writeFileSync(path.join(dir, name), buf);
  return NextResponse.json({ ok:true, url:`/uploads/${name}`, storage:'local' });
}
