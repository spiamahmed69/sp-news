import Link from 'next/link'; import { getArticlesSync } from '@/lib/store';
export const dynamic = 'force-dynamic';
export default function NewsList() { const items = getArticlesSync();
  return (<div><div className="flex justify-between items-center"><h1 className="text-2xl font-black">সংবাদ ব্যবস্থাপনা</h1><Link href="/admin/news/new" className="bg-brand text-white px-4 py-2 rounded font-bold">+ নতুন সংবাদ</Link></div>
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y mt-4">{items.map(a=>(<div key={a.id} className="p-4 flex flex-wrap justify-between gap-2 items-center"><div><p className="font-bold">{a.title} {a.isSample && <span className="text-xs bg-amber-100 text-amber-800 px-2 rounded">SAMPLE</span>}</p><p className="text-xs text-gray-500">{a.categorySlug} • {a.status} • 👁 {a.views} • {a.featured?'⭐':''}{a.breaking?' 🔴':''}</p></div><div className="flex gap-2 text-sm"><Link className="border px-3 py-1 rounded" href={`/news/${a.slug}`}>দেখুন</Link><Link className="border px-3 py-1 rounded" href={`/admin/news/${a.id}/edit`}>সম্পাদনা</Link></div></div>))}</div>
  <p className="text-xs text-gray-500 mt-3">মোছা: API দিয়ে — DELETE /api/admin/articles?id=ID (অ্যাডমিন কুকি প্রয়োজন)।</p></div>);
}
