import { getAds } from '@/lib/store';
export default function AdSlot({ slot, className='' }: { slot: string; className?: string }) {
  const ads = getAds(slot); if (!ads.length) return null; const ad = ads[0];
  return (<div className={`my-6 text-center ${className}`}><a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"><img src={ad.imageUrl} alt={ad.title} className="mx-auto rounded w-full max-w-3xl object-cover" style={{maxHeight:140}} /></a><p className="text-[10px] text-gray-400 mt-1">বিজ্ঞাপন — {ad.title}</p></div>);
}
