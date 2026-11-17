import { NextResponse } from 'next/server'; import { cookies } from 'next/headers'; import { verifySession } from '@/lib/auth'; import { getContactMessages, markMessageRead, deleteMessage } from '@/lib/store';
function authed() { return !!verifySession(cookies().get('spnews_admin')?.value); }
export async function GET() { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401}); return NextResponse.json({ messages: getContactMessages() }); }
export async function POST(req: Request) { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401}); const b=await req.json(); if (b.action==='read') markMessageRead(b.id, true); if (b.action==='delete') deleteMessage(b.id); return NextResponse.json({ ok:true }); }
