import { getArticles, getPublished, dbStatus } from '@/lib/store';
import { dbPing } from '@/lib/db';
export const dynamic = 'force-dynamic';
export default async function DebugPage() {
  const ping = await dbPing();
  const articles = await getArticles();
  const pub = await getPublished();
  return (<div><h1>DEBUG</h1><pre>{JSON.stringify({ ping, dbStatus: dbStatus(), articlesCount: articles.length, publishedCount: pub.length, slugs: articles.map(a => a.slug) }, null, 2)}</pre></div>);
}
