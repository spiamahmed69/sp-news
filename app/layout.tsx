import type { Metadata } from 'next';
import './globals.css'; import Header from '@/components/Header'; import Footer from '@/components/Footer'; import { getSettings } from '@/lib/store';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'SP NEWS | বাংলাদেশের প্রিমিয়াম ডিজিটাল সংবাদপত্র',
  description: 'SP NEWS — সত্য, নির্ভুল ও নিরপেক্ষ সংবাদ। বাংলাদেশ ও বিশ্বের সর্বশেষ খবর।',
  openGraph: { title: 'SP NEWS', description: 'বাংলাদেশের প্রিমিয়াম ডিজিটাল সংবাদপত্র', type: 'website', locale: 'bn_BD', siteName: 'SP NEWS' },
  twitter: { card: 'summary_large_image', title: 'SP NEWS', description: 'বাংলাদেশের প্রিমিয়াম ডিজিটাল সংবাদপত্র' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const s = getSettings();
  const jsonLd = { '@context':'https://schema.org', '@type':'NewsMediaOrganization', name:'SP NEWS', alternateName: s.siteNameBn, url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', description: s.description };
  return (<html lang="bn"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&family=Noto+Serif+Bengali:wght@400;600;700;900&display=swap" rel="stylesheet" />
    <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('spnews-theme'); if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark')}catch(e){}` }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  </head><body className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 min-h-screen flex flex-col"><Header /><main className="flex-1">{children}</main><Footer /></body></html>);
}
