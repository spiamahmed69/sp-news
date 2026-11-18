import Link from 'next/link';
import { getArticles, getPublished, getCategories, getAuthors, getContactMessages, getSubscribers, dbStatus, storageStatus, getSettings } from '@/lib/store';
import { adminConfigured } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function AdminDashboard() {
  const all = await getArticles(); const pub = await getPublished(); const totalViews = all.reduce((s,a)=>s+a.views,0);
  const db = dbStatus(); const st = storageStatus();
  const cards = [['মোট সংবাদ', all.length], ['প্রকাশিত', pub.length], ['খসড়া', all.filter(a=>a.status==='draft').length], ['মোট ভিউ', totalViews.toLocaleString('bn-BD')], ['বিভাগ', (await getCategories()).length], ['লেখক', (await getAuthors()).length], ['বার্তা', (await getContactMessages()).length], ['সাবস্ক্রাইবার', (await getSubscribers()).length]];
  return (<div><h1 className="text-3xl font-black">ড্যাশবোর্ড</h1><p className="text-gray-600 mt-1">স্বাগতম, SP NEWS অ্যাডমিন।</p>
  <div className={`mt-4 p-4 rounded border ${db.connected ? 'bg-green-50 border-green-300 dark:bg-green-950' : 'bg-amber-50 border-amber-300 dark:bg-amber-950'}`}>
    <p className="font-bold">🗄️ ডাটাবেস: {db.mode}</p><p className="text-sm">Configured: {db.configured?'হ্যাঁ':'না'} • Connected: {db.connected?'হ্যাঁ':'না — JSON seed fallback ব্যবহার হচ্ছে, ডাটাবেস সংযুক্ত বলে দেখানো হচ্ছে না'}</p>
    <p className="font-bold mt-2">🖼️ ছবি স্টোরেজ: {st.mode}</p><p className="text-sm">Vercel Blob token: {st.blob?'সেট আছে':'সেট নেই — public/uploads ব্যবহার হচ্ছে'}</p>
    <p className="text-sm mt-1">অ্যাডমিন কনফিগ: {adminConfigured()?'সেট আছে':'সেট নেই — .env.local-এ ADMIN_EMAIL / ADMIN_PASSWORD_HASH দিন (README দেখুন)'}</p>
  </div>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">{cards.map(([l,v])=>(<div key={l as string} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5"><p className="text-sm text-gray-500">{l}</p><p className="text-3xl font-black mt-1">{v}</p></div>))}</div>
  <h2 className="text-xl font-bold mt-8 mb-3">সাম্প্রতিক সংবাদ</h2><div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y">{all.slice(0,8).map(a=>(<div key={a.id} className="p-4 flex justify-between gap-3"><Link href={`/news/${a.slug}`} className="font-medium hover:text-brand">{a.title}</Link><span className="text-xs shrink-0">{a.status} • 👁 {a.views.toLocaleString('bn-BD')}</span></div>))}</div>
  <div className="mt-6 flex gap-2 flex-wrap"><Link href="/admin/news/new" className="bg-brand text-white px-4 py-2 rounded font-bold">+ নতুন সংবাদ</Link><Link href="/api/status" className="border px-4 py-2 rounded">API স্ট্যাটাস দেখুন</Link></div></div>);
}
