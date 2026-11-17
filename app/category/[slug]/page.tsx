import { notFound } from 'next/navigation'; import { getCategory, getPublished } from '@/lib/store'; import ArticleCard from '@/components/ArticleCard';
export const dynamic = 'force-dynamic';
export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = getCategory(params.slug); if (!cat) notFound();
  const items = getPublished().filter(a=>a.categorySlug===cat.slug);
  return (<div className="max-w-7xl mx-auto px-4 py-6"><h1 className="text-3xl font-black border-l-4 border-brand pl-3">{cat.nameBn} <span className="text-lg text-gray-500 font-normal">({cat.name})</span></h1><p className="text-gray-600 dark:text-gray-300 mt-2">{cat.description} — {items.length}টি সংবাদ</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">{items.map(a=><ArticleCard key={a.id} a={a} />)}</div>{items.length===0 && <p className="mt-6 text-gray-500">এই বিভাগে এখনো কোনো সংবাদ নেই।</p>}</div>);
}
