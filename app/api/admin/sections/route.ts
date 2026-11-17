import { NextResponse } from 'next/server'; import { cookies } from 'next/headers'; import { verifySession } from '@/lib/auth'; import { getSections, updateSections } from '@/lib/store';
function authed() { return !!verifySession(cookies().get('spnews_admin')?.value); }
export async function GET() { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401}); return NextResponse.json({ sections: getSections() }); }
export async function POST(req: Request) { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401}); const b=await req.json(); updateSections(b.sections); return NextResponse.json({ ok:true }); }
