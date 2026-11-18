import { getPublished } from '@/lib/store'; import ArticleCard from '@/components/ArticleCard';
export const dynamic = 'force-dynamic';
export default async function LatestPage() { const items = await getPublished(); return (<div className="max-w-7xl mx-auto px-4 py-6"><h1 className="text-3xl font-black border-l-4 border-brand pl-3">সর্বশেষ সংবাদ</h1><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">{items.map(a=><ArticleCard key={a.id} a={a} />)}</div></div>); }
