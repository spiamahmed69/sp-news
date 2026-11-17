import { NextResponse } from 'next/server'; import { getArticles, dbStatus } from '@/lib/store';
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url); const q = searchParams.get('q') || ''; const cat = searchParams.get('category') || '';
  let items = await getArticles(); if (cat) items = items.filter(a=>a.categorySlug===cat);
  if (q) { const s=q.toLowerCase(); items = items.filter(a=>(a.title+a.excerpt+a.content).toLowerCase().includes(s)); }
  return NextResponse.json({ status: dbStatus(), count: items.length, articles: items });
}
