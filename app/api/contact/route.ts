import { NextResponse } from 'next/server'; import { addContactMessage } from '@/lib/store'; import { rateLimit } from '@/lib/rate-limit';
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'local'; if (!rateLimit('contact:'+ip, 10)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  const b = await req.json(); if (!b.name || !b.email || !b.message) return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
  const m = addContactMessage({ id:'m'+Date.now(), name:b.name, email:b.email, subject:b.subject||'', message:b.message, createdAt:new Date().toISOString(), read:false });
  return NextResponse.json({ ok: true, message: m });
}
