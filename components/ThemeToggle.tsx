'use client';
import { useEffect, useState } from 'react';
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  const toggle = () => { const d = !dark; setDark(d); document.documentElement.classList.toggle('dark', d); try { localStorage.setItem('spnews-theme', d ? 'dark' : 'light'); } catch {} };
  return <button onClick={toggle} aria-label="Toggle theme" className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm">{dark ? '☀️ লাইট' : '🌙 ডার্ক'}</button>;
}
