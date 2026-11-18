import { NextResponse } from 'next/server'; import { cookies } from 'next/headers'; import { verifySession } from '@/lib/auth';
import { getSections, updateSections } from '@/lib/store';
function authed() { return !!verifySession(cookies().get('spnews_admin')?.value); }
export async function GET() { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401}); try { return NextResponse.json({ sections: await getSections() }); } catch (e:any) { return NextResponse.json({ error: e?.message || 'Failed to load sections' }, { status: 500 }); } }
export async function POST(req: Request) { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401}); const b=await req.json(); try { await updateSections(b.sections); } catch (e:any) { return NextResponse.json({ error: e?.message || 'Failed to save sections — they were NOT saved' }, { status: 500 }); } return NextResponse.json({ ok:true }); }
