'use client';
import { useState } from 'react';
export default function SimpleCrud({ endpoint, fields, items, title }: { endpoint: string; fields: {key:string;label:string}[]; items: any[]; title: string }) {
  const [list, setList] = useState(items); const [msg, setMsg] = useState('');
  const save = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const body: any = Object.fromEntries(fd.entries());
    const r = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }); const j = await r.json();
    if (!r.ok) { setMsg(`⚠️ ${j.error||'ব্যর্থ'}`); return; } setMsg('✅ সংরক্ষিত হয়েছে'); location.reload(); };
  const del = async (id: string) => { if (!confirm('মুছতে চান?')) return; await fetch(`${endpoint}?id=${id}`, { method:'DELETE' }); location.reload(); };
  return (<div><h1 className="text-2xl font-black mb-4">{title}</h1>
    <form onSubmit={save} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 grid sm:grid-cols-2 gap-3 mb-6">
      {fields.map(f=>(<div key={f.key}><label className="text-sm font-bold">{f.label}</label><input name={f.key} className="w-full border rounded p-2 mt-1 dark:bg-gray-700" /></div>))}
      <div className="sm:col-span-2"><button className="bg-brand text-white px-5 py-2 rounded font-bold">যোগ করুন / সংরক্ষণ</button> {msg && <span className="text-sm ml-2">{msg}</span>}</div>
    </form>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y">{list.map((it:any)=>(<div key={it.id} className="p-4 flex justify-between gap-2 items-center"><span className="text-sm">{fields.map(f=>it[f.key]).filter(Boolean).join(' — ') || it.id}</span><button onClick={()=>del(it.id)} className="text-red-600 text-sm border px-3 py-1 rounded">মুছুন</button></div>))}</div></div>);
}
