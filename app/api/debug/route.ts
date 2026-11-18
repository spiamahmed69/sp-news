import { NextResponse } from 'next/server';
import { getArticles, getPublished, dbStatus } from '@/lib/store';
import { dbPing } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  const ping = await dbPing();
  const articles = await getArticles();
  const pub = await getPublished();
  return NextResponse.json({ ping, dbStatus: dbStatus(), articlesCount: articles.length, publishedCount: pub.length, slugs: articles.map(a => a.slug) });
}
