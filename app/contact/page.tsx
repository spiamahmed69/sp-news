'use client';
import { useState } from 'react';
export default function Contact() {
  const [f, setF] = useState({ name:'', email:'', subject:'', message:'' }); const [msg, setMsg] = useState('');
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setMsg('পাঠানো হচ্ছে…');
    const r = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f) });
    const j = await r.json(); setMsg(r.ok ? '✅ ধন্যবাদ! আপনার বার্তা পৌঁছেছে।' : `⚠️ ${j.error||'ব্যর্থ হয়েছে'}`); if (r.ok) setF({name:'',email:'',subject:'',message:''}); };
  const set = (k:string,v:string)=>setF({...f,[k]:v});
  return (<div className="max-w-2xl mx-auto px-4 py-10"><div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"><h1 className="text-3xl font-black">যোগাযোগ করুন</h1><p className="text-gray-600 dark:text-gray-300 mt-2">সংবাদ, মতামত বা যেকোনো বিষয়ে লিখুন। ইমেইল: newsroom@spnews.com.bd</p>
  <form onSubmit={submit} className="space-y-4 mt-6">
    <input required value={f.name} onChange={e=>set('name',e.target.value)} placeholder="আপনার নাম" className="w-full border rounded p-3 dark:bg-gray-700 dark:border-gray-600" />
    <input required type="email" value={f.email} onChange={e=>set('email',e.target.value)} placeholder="ইমেইল" className="w-full border rounded p-3 dark:bg-gray-700 dark:border-gray-600" />
    <input value={f.subject} onChange={e=>set('subject',e.target.value)} placeholder="বিষয়" className="w-full border rounded p-3 dark:bg-gray-700 dark:border-gray-600" />
    <textarea required value={f.message} onChange={e=>set('message',e.target.value)} rows={5} placeholder="আপনার বার্তা" className="w-full border rounded p-3 dark:bg-gray-700 dark:border-gray-600" />
    <button className="bg-brand text-white px-6 py-3 rounded font-bold">পাঠান</button>{msg && <p className="text-sm">{msg}</p>}
  </form></div></div>);
}
