import Link from 'next/link';
import { getCategories, getSettings } from '@/lib/store';
import NewsletterForm from './NewsletterForm';
export default function Footer() {
  const cats = getCategories(); const s = getSettings();
  return (<footer className="bg-gray-900 text-gray-300 mt-12">
    <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
      <div><div className="text-white font-black text-2xl">SP <span className="text-red-400">NEWS</span></div><p className="text-sm mt-2">{s.description}</p><p className="text-sm mt-3">✉️ {s.contactEmail}<br/>📞 {s.contactPhone}<br/>📍 {s.address}</p></div>
      <div><h3 className="text-white font-bold mb-3">বিভাগ</h3><ul className="space-y-1 text-sm">{cats.map(c=><li key={c.id}><Link className="hover:text-white" href={`/category/${c.slug}`}>{c.nameBn}</Link></li>)}</ul></div>
      <div><h3 className="text-white font-bold mb-3">গুরুত্বপূর্ণ লিংক</h3><ul className="space-y-1 text-sm"><li><Link className="hover:text-white" href="/about">আমাদের সম্পর্কে</Link></li><li><Link className="hover:text-white" href="/contact">যোগাযোগ</Link></li><li><Link className="hover:text-white" href="/privacy">গোপনীয়তা নীতি</Link></li><li><Link className="hover:text-white" href="/terms">শর্তাবলি</Link></li><li><Link className="hover:text-white" href="/editorial-policy">সম্পাদকীয় নীতি</Link></li><li><Link className="hover:text-white" href="/latest">সর্বশেষ সংবাদ</Link></li><li><Link className="hover:text-white" href="/trending">ট্রেন্ডিং</Link></li></ul></div>
      <div><h3 className="text-white font-bold mb-3">নিউজলেটার</h3><p className="text-sm mb-3">সর্বশেষ খবর ইমেইলে পান।</p><NewsletterForm /></div>
    </div>
    <div className="border-t border-gray-800"><div className="max-w-7xl mx-auto px-4 py-4 text-xs flex flex-wrap justify-between gap-2"><span>© {new Date().getFullYear()} SP NEWS — সর্বস্বত্ব সংরক্ষিত।</span><span>সম্পাদক: সিয়াম আহমেদ</span></div></div>
  </footer>);
}
