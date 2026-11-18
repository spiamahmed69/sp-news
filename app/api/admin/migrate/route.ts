// POST /api/admin/migrate — admin only. Creates the Postgres tables
// (DB_SCHEMA_SQL) and seeds them from data/seed.json ONLY if the articles
// table is empty. Idempotent: safe to call again; it never overwrites
// existing articles. Requires the spnews_admin session cookie.
// After setting DATABASE_URL on Vercel and deploying, call this once, then
// verify with GET /api/status (database.mode should be "PostgreSQL").
import { NextResponse } from 'next/server'; import { cookies } from 'next/headers'; import { verifySession } from '@/lib/auth';
import { migrateDb, dbStatus } from '@/lib/store';
function authed() { return !!verifySession(cookies().get('spnews_admin')?.value); }
export async function GET() { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401}); return NextResponse.json({ database: dbStatus(), usage: 'POST to this endpoint (admin cookie required) to create tables and seed only when articles is empty.' }); }
export async function POST() { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401});
  try { const r = await migrateDb(); return NextResponse.json({ ok:true, ...r, database: dbStatus() }); }
  catch (e:any) { return NextResponse.json({ ok:false, error: e?.message || 'Migration failed' }, { status: 500 }); } }
