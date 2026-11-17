import { NextResponse } from 'next/server'; import type { NextRequest } from 'next/server';
import { verifySessionEdge } from '@/lib/session-edge';
export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (p.startsWith('/admin') && p !== '/admin/login') {
    const token = req.cookies.get('spnews_admin')?.value;
    if (!await verifySessionEdge(token)) { const url = req.nextUrl.clone(); url.pathname = '/admin/login'; return NextResponse.redirect(url); }
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*'] };
