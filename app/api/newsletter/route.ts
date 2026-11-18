import { NextResponse } from 'next/server'; import { addSubscriber } from '@/lib/store'; import { rateLimit } from '@/lib/rate-limit';
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'local'; if (!rateLimit('newsletter:'+ip, 10)) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  const { email } = await req.json(); if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  try { const added = await addSubscriber(email); return NextResponse.json({ ok: true, added, message: added ? 'Subscribed' : 'Already subscribed' }); }
  catch (e:any) { return NextResponse.json({ error: e?.message || 'Failed to subscribe — not saved' }, { status: 500 }); }
}
