'use client'; import { useRouter } from 'next/navigation';
export default function LogoutButton(){ const r=useRouter(); return <button onClick={async()=>{ await fetch('/api/auth/logout',{method:'POST'}); r.push('/admin/login'); r.refresh(); }} className="border rounded px-3 py-2 text-red-600">লগআউট</button>; }
