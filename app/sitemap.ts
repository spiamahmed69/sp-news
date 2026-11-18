import type { MetadataRoute } from 'next'; import { getPublished, getCategories } from '@/lib/store';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date();
  return [{ url: base, lastModified: now }, { url: `${base}/latest`, lastModified: now }, { url: `${base}/trending`, lastModified: now },
    ...(await getPublished()).map(a=>({ url: `${base}/news/${a.slug}`, lastModified: new Date(a.publishedAt) })),
    ...(await getCategories()).map(c=>({ url: `${base}/category/${c.slug}`, lastModified: now }))];
}
