import SimpleCrud from '@/components/SimpleCrud'; import { getAllAds } from '@/lib/store';
export const dynamic='force-dynamic';
export default async function Ads(){ return <SimpleCrud endpoint="/api/admin/ads" title="বিজ্ঞাপন ব্যবস্থাপনা" fields={[{key:'title',label:'শিরোনাম'},{key:'slot',label:'Slot (top-banner / sidebar / in-feed)'},{key:'imageUrl',label:'ছবির URL'},{key:'linkUrl',label:'লিংক URL'}]} items={await getAllAds()} />; }
