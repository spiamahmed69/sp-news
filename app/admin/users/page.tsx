import { getUsers } from '@/lib/store';
export const dynamic='force-dynamic';
export default function Users(){ const users=getUsers(); return (<div><h1 className="text-2xl font-black mb-4">ব্যবহারকারী / ভূমিকা ব্যবস্থাপনা</h1>
<p className="text-sm text-gray-600 mb-4">অ্যাডমিন লগইন <code>ADMIN_EMAIL</code> / <code>ADMIN_PASSWORD_HASH</code> দিয়ে নিয়ন্ত্রিত হয় (README দেখুন)। নিচের তালিকাটি সিড ডেটা থেকে আসে; নতুন ব্যবহারকারী যোগ করতে .env-এ অ্যাডমিন সেট করুন।</p>
<div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y">{users.map(u=>(<div key={u.id} className="p-4 flex justify-between"><span><b>{u.name}</b> — {u.email}</span><span className="text-sm bg-brand/10 text-brand px-2 py-1 rounded">{u.role}</span></div>))}</div></div>); }
