'use client';
import { useState } from 'react'; import { useRouter } from 'next/navigation';
export default function AdminLogin() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [msg, setMsg] = useState(''); const router = useRouter();
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setMsg('লগইন হচ্ছে…');
    const r = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const j = await r.json(); if (!r.ok) { setMsg(`⚠️ ${j.error||'লগইন ব্যর্থ'}`); return; } router.push('/admin'); router.refresh(); };
  return (<div className="max-w-md mx-auto px-4 py-16"><div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"><h1 className="text-2xl font-black">অ্যাডমিন লগইন</h1><p className="text-sm text-gray-500 mt-1">SP NEWS ড্যাশবোর্ডে প্রবেশ করুন।</p>
  <form onSubmit={submit} className="space-y-4 mt-5"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="অ্যাডমিন ইমেইল" className="w-full border rounded p-3 dark:bg-gray-700" /><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="পাসওয়ার্ড" className="w-full border rounded p-3 dark:bg-gray-700" /><button className="w-full bg-brand text-white py-3 rounded font-bold">লগইন</button>{msg && <p className="text-sm">{msg}</p>}</form>
  <p className="text-xs text-gray-500 mt-4">প্রথমবার সেটআপ: README দেখুন — <code>ADMIN_EMAIL</code> ও <code>ADMIN_PASSWORD_HASH</code> সেট করুন।</p></div></div>);
}
