import Link from 'next/link'; import Image from 'next/image';
import type { Article } from '@/lib/types'; import { getCategory, getAuthor } from '@/lib/store';
export default async function ArticleCard({ a, large=false }: { a: Article; large?: boolean }) {
  const cat = await getCategory(a.categorySlug); const author = await getAuthor(a.authorSlug);
  return (<article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition fade-up">
    <Link href={`/news/${a.slug}`}><div className={`relative w-full ${large?'h-64 sm:h-80':'h-44'}`}><Image src={a.featuredImage} alt={a.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />{a.breaking && <span className="absolute top-2 left-2 bg-brand text-white text-xs font-bold px-2 py-1 rounded">ব্রেকিং</span>}{a.isSample && <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">SAMPLE</span>}</div></Link>
    <div className="p-4"><div className="flex gap-2 text-xs text-gray-500"><Link href={`/category/${a.categorySlug}`} className="text-brand font-bold">{cat?.nameBn || a.categorySlug}</Link><span>•</span><span>{new Date(a.publishedAt).toLocaleDateString('bn-BD')}</span><span>•</span><span>👁 {a.views.toLocaleString('bn-BD')}</span></div>
    <h3 className={`${large?'text-xl sm:text-2xl':'text-base'} font-bold mt-2 leading-snug`}><Link href={`/news/${a.slug}`} className="hover:text-brand">{a.title}</Link></h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{a.excerpt}</p>
    {author && <p className="text-xs text-gray-500 mt-3">✍️ <Link href={`/author/${author.slug}`} className="hover:underline">{author.nameBn}</Link></p>}</div>
  </article>);
}
