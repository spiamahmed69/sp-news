import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (<div className="max-w-7xl mx-auto px-4 py-6"><div className="flex flex-wrap gap-2 mb-6 text-sm">
    {[['/admin','ড্যাশবোর্ড'],['/admin/news','সংবাদ'],['/admin/news/new','+ নতুন সংবাদ'],['/admin/categories','বিভাগ'],['/admin/authors','লেখক'],['/admin/users','ব্যবহারকারী'],['/admin/media','ছবি লাইব্রেরি'],['/admin/ads','বিজ্ঞাপন'],['/admin/sections','হোমপেজ সেকশন'],['/admin/settings','সেটিংস ও SEO'],['/admin/messages','বার্তা']].map(([href,label])=>(<Link key={href} href={href} className="bg-white dark:bg-gray-800 border rounded px-3 py-2 hover:bg-brand hover:text-white">{label}</Link>))}
    <LogoutButton />
  </div>{children}</div>);
}
