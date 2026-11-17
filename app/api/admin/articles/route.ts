import { NextResponse } from 'next/server'; import { cookies } from 'next/headers'; import { verifySession } from '@/lib/auth';
import { getArticlesSync, upsertArticle, deleteArticle, slugify } from '@/lib/store';
function authed() { return !!verifySession(cookies().get('spnews_admin')?.value); }
export async function GET() { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401}); return NextResponse.json({ articles: getArticlesSync() }); }
export async function POST(req: Request) { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401});
  const b = await req.json(); if (!b.title || !b.content) return NextResponse.json({ error:'Title and content required' },{status:400});
  const a = { id: b.id || ('a'+Date.now()), title: b.title, titleEn: b.titleEn||'', slug: b.slug || slugify(b.title), excerpt: b.excerpt||'', content: b.content, categorySlug: b.categorySlug||'bangladesh', authorSlug: b.authorSlug||'siam-ahmed', tags: Array.isArray(b.tags)?b.tags:String(b.tags||'').split(',').map((s:string)=>s.trim()).filter(Boolean), featuredImage: b.featuredImage||'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80', gallery: b.gallery||[], status: b.status||'draft', featured: !!b.featured, breaking: !!b.breaking, views: b.views||0, publishedAt: b.publishedAt||new Date().toISOString(), seoTitle: b.seoTitle||'', seoDescription: b.seoDescription||'', isSample: false };
  upsertArticle(a); return NextResponse.json({ ok:true, article:a }); }
export async function DELETE(req: Request) { if (!authed()) return NextResponse.json({ error:'Unauthorized' },{status:401}); const { searchParams } = new URL(req.url); deleteArticle(searchParams.get('id')||''); return NextResponse.json({ ok:true }); }
