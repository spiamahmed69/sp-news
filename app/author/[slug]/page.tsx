import { notFound } from 'next/navigation'; import Image from 'next/image'; import { getAuthor, getPublished } from '@/lib/store'; import ArticleCard from '@/components/ArticleCard';
export const dynamic = 'force-dynamic';
export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const author = await getAuthor(params.slug); if (!author) notFound();
  const items = (await getPublished()).filter(a=>a.authorSlug===author.slug);
  return (<div className="max-w-7xl mx-auto px-4 py-6"><div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex gap-4 items-center">{author.avatar && <Image src={author.avatar} alt={author.nameBn} width={96} height={96} className="rounded-full object-cover" />}<div><h1 className="text-2xl font-black">{author.nameBn}</h1><p className="text-brand font-bold text-sm">{author.role}</p><p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{author.bio}</p><p className="text-xs text-gray-500 mt-1">{items.length}টি সংবাদ</p></div></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">{items.map(a=><ArticleCard key={a.id} a={a} />)}</div></div>);
}
