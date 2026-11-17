import { searchArticles } from '@/lib/store'; import ArticleCard from '@/components/ArticleCard';
export const dynamic = 'force-dynamic';
export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || ''; const items = q ? searchArticles(q) : [];
  return (<div className="max-w-7xl mx-auto px-4 py-6"><h1 className="text-3xl font-black">অনুসন্ধান{q && <>: “{q}”</>}</h1><p className="text-gray-600 mt-2">{items.length}টি ফলাফল পাওয়া গেছে।</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">{items.map(a=><ArticleCard key={a.id} a={a} />)}</div>{q && items.length===0 && <p className="mt-6 text-gray-500">কোনো সংবাদ পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।</p>}{!q && <p className="mt-6 text-gray-500">উপরে সার্চ বক্সে শব্দ লিখে খুঁজুন।</p>}</div>);
}
