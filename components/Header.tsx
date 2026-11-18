import Link from 'next/link';
import { getCategories, getSettings, getPublished } from '@/lib/store';
import ThemeToggle from './ThemeToggle';
export default async function Header() {
  const cats = await getCategories(); const s = await getSettings(); const breaking = (await getPublished()).filter(a=>a.breaking).slice(0,5);
  const today = new Date().toLocaleDateString('bn-BD', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  return (<header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow">
    <div className="bg-brand text-white text-xs sm:text-sm"><div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between gap-2"><span>{today} | ঢাকা, বাংলাদেশ</span><span className="hidden sm:inline">{s.tagline}</span><span><Link href="/admin/login" className="underline">অ্যাডমিন</Link></span></div></div>
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-2"><span className="bg-brand text-white font-black text-2xl sm:text-3xl px-3 py-1 rounded">SP</span><span className="leading-tight"><span className="block font-black text-2xl sm:text-3xl text-brand">NEWS</span><span className="block text-xs text-gray-500 dark:text-gray-400">{s.siteNameBn} — সত্য, নির্ভুল ও নিরপেক্ষ</span></span></Link>
      <form action="/search" method="get" className="hidden md:flex flex-1 max-w-md"><input name="q" placeholder="খবর খুঁজুন…" className="flex-1 border rounded-l px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" /><button className="bg-brand text-white px-4 rounded-r text-sm">খুঁজুন</button></form>
      <ThemeToggle />
    </div>
    <nav className="bg-gray-900 text-white overflow-x-auto"><div className="max-w-7xl mx-auto px-4 flex gap-1 text-sm whitespace-nowrap">
      <Link className="px-3 py-2 hover:bg-brand" href="/">হোম</Link><Link className="px-3 py-2 hover:bg-brand" href="/latest">সর্বশেষ</Link><Link className="px-3 py-2 hover:bg-brand" href="/trending">ট্রেন্ডিং</Link>
      {cats.map(c=><Link key={c.id} className="px-3 py-2 hover:bg-brand" href={`/category/${c.slug}`}>{c.nameBn}</Link>)}
      <Link className="px-3 py-2 hover:bg-brand" href="/about">আমাদের সম্পর্কে</Link><Link className="px-3 py-2 hover:bg-brand" href="/contact">যোগাযোগ</Link>
    </div></nav>
    {breaking.length>0 && <div className="bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-900 overflow-hidden"><div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-2"><span className="bg-brand text-white text-xs font-bold px-2 py-0.5 rounded shrink-0 animate-pulse">ব্রেকিং</span><div className="overflow-hidden flex-1"><div className="ticker-track">{[...breaking, ...breaking].map((a,i)=><Link key={i} href={`/news/${a.slug}`} className="mx-4 text-sm text-red-800 dark:text-red-200 hover:underline">• {a.title}</Link>)}</div></div></div></div>}
  </header>);
}
