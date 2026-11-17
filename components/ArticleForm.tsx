'use client';
import { useState } from 'react'; import { useRouter } from 'next/navigation'; import RichTextEditor from './RichTextEditor';
export default function ArticleForm({ initial, categories, authors }: { initial?: any; categories: any[]; authors: any[] }) {
  const router = useRouter(); const [msg, setMsg] = useState(''); const [img, setImg] = useState(initial?.featuredImage || '');
  const submit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget);
    const body: any = Object.fromEntries(fd.entries()); body.featured = fd.get('featured')==='on'; body.breaking = fd.get('breaking')==='on'; body.tags = String(body.tags||'').split(',').map((s:string)=>s.trim()).filter(Boolean); body.gallery = String(body.gallery||'').split(',').map((s:string)=>s.trim()).filter(Boolean); body.featuredImage = img || body.featuredImage;
    const r = await fetch('/api/admin/articles', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }); const j = await r.json();
    if (!r.ok) { setMsg(`⚠️ ${j.error||'ব্যর্থ'}`); return; } router.push('/admin/news'); router.refresh(); };
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const fd = new FormData(); fd.append('file', f); const r = await fetch('/api/upload', { method:'POST', body: fd }); const j = await r.json(); if (r.ok) { setImg(j.url); setMsg(`✅ আপলোড হয়েছে (${j.storage}): ${j.url}`); } else setMsg(`⚠️ ${j.error}`); };
  const a = initial || {};
  return (<form onSubmit={submit} className="space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <input type="hidden" name="id" defaultValue={a.id||''} />
    <div><label className="font-bold text-sm">বাংলা শিরোনাম *</label><input required name="title" defaultValue={a.title||''} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div>
    <div><label className="font-bold text-sm">ইংরেজি শিরোনাম (ঐচ্ছিক)</label><input name="titleEn" defaultValue={a.titleEn||''} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div>
    <div className="grid sm:grid-cols-2 gap-4"><div><label className="font-bold text-sm">Slug</label><input name="slug" defaultValue={a.slug||''} placeholder="খালি রাখলে শিরোনাম থেকে তৈরি হবে" className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div><div><label className="font-bold text-sm">প্রকাশের তারিখ</label><input type="datetime-local" name="publishedAt" defaultValue={a.publishedAt?String(a.publishedAt).slice(0,16):''} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div></div>
    <div><label className="font-bold text-sm">সংক্ষিপ্ত বিবরণ</label><textarea name="excerpt" defaultValue={a.excerpt||''} rows={2} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div>
    <div><label className="font-bold text-sm">বিস্তারিত কনটেন্ট *</label><div className="mt-1"><RichTextEditor name="content" defaultValue={a.content||''} /></div></div>
    <div className="grid sm:grid-cols-3 gap-4">
      <div><label className="font-bold text-sm">বিভাগ</label><select name="categorySlug" defaultValue={a.categorySlug||'bangladesh'} className="w-full border rounded p-3 mt-1 dark:bg-gray-700">{categories.map((c:any)=><option key={c.id} value={c.slug}>{c.nameBn}</option>)}</select></div>
      <div><label className="font-bold text-sm">লেখক</label><select name="authorSlug" defaultValue={a.authorSlug||'siam-ahmed'} className="w-full border rounded p-3 mt-1 dark:bg-gray-700">{authors.map((x:any)=><option key={x.id} value={x.slug}>{x.nameBn}</option>)}</select></div>
      <div><label className="font-bold text-sm">স্ট্যাটাস</label><select name="status" defaultValue={a.status||'draft'} className="w-full border rounded p-3 mt-1 dark:bg-gray-700"><option value="draft">খসড়া (Draft)</option><option value="published">প্রকাশিত (Published)</option><option value="scheduled">নির্ধারিত (Scheduled)</option></select></div>
    </div>
    <div><label className="font-bold text-sm">ট্যাগ (কমা দিয়ে)</label><input name="tags" defaultValue={(a.tags||[]).join(', ')} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div>
    <div><label className="font-bold text-sm">ফিচার্ড ছবির URL</label><input name="featuredImage" value={img} onChange={e=>setImg(e.target.value)} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" placeholder="https://…" /><label className="text-sm mt-2 block">অথবা আপলোড করুন: <input type="file" accept="image/*" onChange={upload} className="text-sm" /></label></div>
    <div><label className="font-bold text-sm">গ্যালারি URL (কমা দিয়ে)</label><input name="gallery" defaultValue={(a.gallery||[]).join(', ')} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div>
    <div className="grid sm:grid-cols-2 gap-4"><div><label className="font-bold text-sm">SEO Title</label><input name="seoTitle" defaultValue={a.seoTitle||''} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div><div><label className="font-bold text-sm">SEO Description</label><input name="seoDescription" defaultValue={a.seoDescription||''} className="w-full border rounded p-3 mt-1 dark:bg-gray-700" /></div></div>
    <div className="flex gap-6"><label className="flex gap-2 items-center"><input type="checkbox" name="featured" defaultChecked={!!a.featured} /> ⭐ ফিচার্ড</label><label className="flex gap-2 items-center"><input type="checkbox" name="breaking" defaultChecked={!!a.breaking} /> 🔴 ব্রেকিং</label></div>
    {a.views!==undefined && <p className="text-sm text-gray-500">👁 ভিউ: {a.views.toLocaleString('bn-BD')}</p>}
    <button className="bg-brand text-white px-6 py-3 rounded font-bold">সংরক্ষণ করুন</button>{msg && <p className="text-sm">{msg}</p>}
  </form>);
}
