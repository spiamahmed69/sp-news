'use client';
import { useRef } from 'react';
export default function RichTextEditor({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (tag: string) => { const el = ref.current; if (!el) return; const s = el.selectionStart, e = el.selectionEnd; const v = el.value; el.value = v.slice(0,s) + `<${tag}>` + v.slice(s,e) + `</${tag}>` + v.slice(e); el.focus(); };
  return (<div><div className="flex gap-1 mb-1 flex-wrap">
    <button type="button" onClick={()=>wrap('b')} className="px-2 py-1 border rounded text-sm font-bold">B</button>
    <button type="button" onClick={()=>wrap('i')} className="px-2 py-1 border rounded text-sm italic">I</button>
    <button type="button" onClick={()=>wrap('h2')} className="px-2 py-1 border rounded text-sm">H2</button>
    <button type="button" onClick={()=>wrap('p')} className="px-2 py-1 border rounded text-sm">¶</button>
    <button type="button" onClick={()=>wrap('blockquote')} className="px-2 py-1 border rounded text-sm">❝ উদ্ধৃতি</button>
    <span className="text-xs text-gray-500 self-center ml-2">HTML ট্যাগ সমর্থিত (p, b, i, h2, ul/li, blockquote)</span></div>
    <textarea ref={ref} name={name} defaultValue={defaultValue} rows={12} className="w-full border rounded p-3 dark:bg-gray-800 dark:border-gray-700" placeholder="<p>সংবাদের বিস্তারিত লিখুন…</p>" /></div>);
}
