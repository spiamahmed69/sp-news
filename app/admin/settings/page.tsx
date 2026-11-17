'use client';
import { useState } from 'react';
export default function SettingsPage(){ const [msg,setMsg]=useState(''); const [seoTitle,setSeoTitle]=useState(''); const [seoDescription,setSeoDescription]=useState(''); const [tagline,setTagline]=useState('');
 const save=async(e:React.FormEvent)=>{ e.preventDefault(); const r=await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:{seoTitle,seoDescription,tagline}})}); setMsg(r.ok?'✅ সংরক্ষিত':'⚠️ ব্যর্থ'); };
 return (<div><h1 className="text-2xl font-black mb-4">সাইট সেটিংস ও SEO</h1><form onSubmit={save} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4 max-w-2xl">
 <div><label className="font-bold text-sm">SEO Title</label><input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" placeholder="SP NEWS | ..." /></div>
 <div><label className="font-bold text-sm">SEO Description</label><textarea value={seoDescription} onChange={e=>setSeoDescription(e.target.value)} rows={3} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div>
 <div><label className="font-bold text-sm">Tagline</label><input value={tagline} onChange={e=>setTagline(e.target.value)} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div>
 <button className="bg-brand text-white px-6 py-2 rounded font-bold">সংরক্ষণ</button>{msg && <span className="text-sm ml-2">{msg}</span>}</form>
 <p className="text-sm text-gray-500 mt-4">সাইটের নাম, লোগো, যোগাযোগ তথ্য <code>data/seed.json</code>-এর settings অংশে আছে; ডাটাবেস চালু হলে সেটিংস টেবিলে যাবে।</p></div>); }
