import { notFound } from 'next/navigation'; import Link from 'next/link'; import Image from 'next/image';
import { getArticleBySlug, getPublished, relatedArticles, incrementViews, getAuthor, getCategory } from '@/lib/store';
import ArticleCard from '@/components/ArticleCard'; import AdSlot from '@/components/AdSlot';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const a = await getArticleBySlug(params.slug); if (!a) return { title: 'খবর পাওয়া যায়নি | SP NEWS' };
  return { title: a.seoTitle || `${a.title} | SP NEWS`, description: a.seoDescription || a.excerpt, openGraph: { title: a.title, description: a.excerpt, type: 'article', images: [a.featuredImage] } };
}
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const a = await getArticleBySlug(params.slug); if (!a || a.status !== 'published') notFound();
  await incrementViews(a.slug); const author = await getAuthor(a.authorSlug); const cat = await getCategory(a.categorySlug); const related = await relatedArticles(a, 4);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/news/${a.slug}`;
  const jsonLd = { '@context':'https://schema.org', '@type':'NewsArticle', headline: a.title, image:[a.featuredImage], datePublished: a.publishedAt, author:{'@type':'Person', name: author?.name || ''}, publisher:{'@type':'Organization', name:'SP NEWS'} };
  return (<div className="max-w-7xl mx-auto px-4 py-6 grid gap-8 lg:grid-cols-3">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <article className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-5 sm:p-8">
      <div className="text-sm"><Link href={`/category/${a.categorySlug}`} className="text-brand font-bold">{cat?.nameBn}</Link> • {new Date(a.publishedAt).toLocaleDateString('bn-BD', { dateStyle: 'full' })}</div>
      <h1 className="text-2xl sm:text-4xl font-black leading-tight mt-2">{a.title}</h1>
      {a.titleEn && <p className="text-gray-500 mt-1">{a.titleEn}</p>}
      <p className="text-lg text-gray-600 dark:text-gray-300 mt-3">{a.excerpt}</p>
      <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500 border-y py-3">
        {author && <span>✍️ <Link href={`/author/${author.slug}`} className="font-bold text-gray-800 dark:text-gray-200 hover:underline">{author.nameBn}</Link> — {author.role}</span>}
        <span>👁 {a.views.toLocaleString('bn-BD')} বার পঠিত</span>{a.isSample && <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded">SAMPLE সংবাদ</span>}
      </div>
      <div className="relative w-full h-64 sm:h-96 mt-5 rounded-lg overflow-hidden"><Image src={a.featuredImage} alt={a.title} fill className="object-cover" priority /></div>
      {a.gallery?.length>0 && <div className="grid grid-cols-3 gap-2 mt-3">{a.gallery.map((g,i)=>(<div key={i} className="relative h-24"><Image src={g} alt={`gallery ${i+1}`} fill className="object-cover rounded" /></div>))}</div>}
      <div className="prose-bn mt-6 text-base sm:text-lg" dangerouslySetInnerHTML={{ __html: a.content }} />
      <div className="flex flex-wrap gap-2 mt-6">{a.tags.map(t=>(<Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs">#{t}</Link>))}</div>
      <div className="mt-6 border-t pt-4"><p className="font-bold mb-2">শেয়ার করুন:</p><div className="flex gap-2 flex-wrap">
        <a className="bg-blue-600 text-white px-3 py-2 rounded text-sm" target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Facebook</a>
        <a className="bg-black text-white px-3 py-2 rounded text-sm" target="_blank" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(a.title)}`}>X / Twitter</a>
        <a className="bg-green-600 text-white px-3 py-2 rounded text-sm" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(a.title+' '+url)}`}>WhatsApp</a>
        <a className="bg-blue-500 text-white px-3 py-2 rounded text-sm" target="_blank" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(a.title)}`}>Telegram</a>
      </div></div>
    </article>
    <aside className="space-y-6"><AdSlot slot="sidebar" /><section className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow"><h2 className="font-black text-lg mb-3">সম্পর্কিত সংবাদ</h2><div className="space-y-4">{related.map(r=><ArticleCard key={r.id} a={r} />)}</div>{related.length===0 && <p className="text-sm text-gray-500">সম্পর্কিত সংবাদ নেই।</p>}</section></aside>
  </div>);
}
