import fs from 'fs'; import path from 'path'; import { getPublished, storageStatus } from '@/lib/store';
export const dynamic='force-dynamic';
export default async function Media(){ const st=storageStatus(); let local:string[]=[]; try{ local=fs.readdirSync(path.join(process.cwd(),'public','uploads')).filter(f=>f!=='.gitkeep'); }catch{}
  const imgs=(await getPublished()).map(a=>a.featuredImage);
  return (<div><h1 className="text-2xl font-black mb-4">ছবি লাইব্রেরি</h1><p className="text-sm mb-4">স্টোরেজ: <b>{st.mode}</b> {st.blob?'':'— BLOB_READ_WRITE_TOKEN সেট করলে Vercel Blob ব্যবহৃত হবে।'}</p>
  <h2 className="font-bold mb-2">স্থানীয় আপলোড (public/uploads)</h2>{local.length? <ul className="bg-white dark:bg-gray-800 rounded shadow divide-y">{local.map(f=>(<li key={f} className="p-3 text-sm"><a className="text-brand underline" href={`/uploads/${f}`}>/uploads/{f}</a></li>))}</ul> : <p className="text-sm text-gray-500">এখনো কোনো স্থানীয় আপলোড নেই। সংবাদ ফর্ম থেকে ছবি আপলোড করুন।</p>}
  <h2 className="font-bold mt-6 mb-2">সংবাদের ফিচার্ড ছবি</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{imgs.map((u,i)=>(<img key={i} src={u} alt="" className="h-32 w-full object-cover rounded" />))}</div></div>); }
