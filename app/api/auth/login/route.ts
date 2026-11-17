import { NextResponse } from 'next/server'; import { verifyAdmin, signSession, ADMIN_COOKIE, adminConfigured } from '@/lib/auth'; import { rateLimit } from '@/lib/rate-limit';
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'local'; if (!rateLimit('login:'+ip, 5)) return NextResponse.json({ error: 'Too many login attempts. Try again in a minute.' }, { status: 429 });
  if (!adminConfigured()) return NextResponse.json({ error: 'Admin not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH (see README).' }, { status: 500 });
  const { email, password } = await req.json(); const ok = await verifyAdmin(email||'', password||'');
  if (!ok) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  const res = NextResponse.json({ ok: true }); res.cookies.set(ADMIN_COOKIE, signSession(email), { httpOnly: true, path: '/', maxAge: 7*24*3600, sameSite: 'lax' }); return res;
}
