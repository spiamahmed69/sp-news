'use client';
import { useState } from 'react';
export default function NewsletterForm() {
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState('');
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setMsg('পাঠানো হচ্ছে…');
    const r = await fetch('/api/newsletter', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
    const j = await r.json(); setMsg(r.ok ? '✅ ধন্যবাদ! সাবস্ক্রাইব সম্পন্ন হয়েছে।' : `⚠️ ${j.error || 'ব্যর্থ হয়েছে'}`); if (r.ok) setEmail(''); };
  return (<form onSubmit={submit} className="flex flex-col gap-2"><div className="flex"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="আপনার ইমেইল" className="flex-1 min-w-0 px-3 py-2 rounded-l text-sm text-gray-900" /><button className="bg-brand text-white px-4 rounded-r text-sm shrink-0">সাবস্ক্রাইব</button></div>{msg && <p className="text-xs">{msg}</p>}</form>);
}
