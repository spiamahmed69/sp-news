import fs from 'fs'; import path from 'path';
import seed from '../data/seed.json';
import type { SeedData, Article, Category, Author } from './types';
import { getPool } from './db';

const seedPath = path.join(process.cwd(), 'data', 'seed.json');
// In-memory working copy (seed fallback). Writes update this copy and, when
// there is no DATABASE_URL, persist back to data/seed.json (local dev only).
let data: SeedData = JSON.parse(JSON.stringify(seed)) as SeedData;
let dbChecked = false; let dbAvailable = false;

export function dbStatus(): { configured: boolean; connected: boolean; mode: string } {
  const configured = !!process.env.DATABASE_URL;
  return { configured, connected: configured && dbAvailable, mode: configured ? (dbAvailable ? 'PostgreSQL' : 'PostgreSQL (unreachable — using JSON fallback)') : 'JSON seed fallback (no DATABASE_URL)' };
}
export function storageStatus(): { blob: boolean; mode: string } {
  const blob = !!process.env.BLOB_READ_WRITE_TOKEN;
  return { blob, mode: blob ? 'Vercel Blob' : 'Local public/uploads' };
}
async function tryDbArticles(): Promise<Article[] | null> {
  const pool = getPool(); if (!pool) return null;
  try {
    const r = await pool.query('SELECT id,title,title_en AS "titleEn",slug,excerpt,content,category_slug AS "categorySlug",author_slug AS "authorSlug",tags,featured_image AS "featuredImage",gallery,status,featured,breaking,views,published_at AS "publishedAt",seo_title AS "seoTitle",seo_description AS "seoDescription",is_sample AS "isSample" FROM articles ORDER BY published_at DESC');
    dbAvailable = true; dbChecked = true;
    return r.rows as Article[];
  } catch { dbChecked = true; dbAvailable = false; return null; }
}
function persist() { try { fs.writeFileSync(seedPath, JSON.stringify(data, null, 2)); } catch {} }
export function getSettings() { return data.settings; }
export function getCategories(): Category[] { return data.categories; }
export function getCategory(slug: string) { return data.categories.find(c => c.slug === slug); }
export function getAuthors(): Author[] { return data.authors; }
export function getAuthor(slug: string) { return data.authors.find(a => a.slug === slug); }
export function getAds(slot?: string) { return data.ads.filter(a => a.active && (!slot || a.slot === slot)); }
export function getAllAds() { return data.ads; }
export function getUsers() { return data.users; }
export function getContactMessages() { return [...data.contactMessages].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
export function getSubscribers() { return data.newsletterSubscribers; }
export function getSections() { return [...data.homepageSections].sort((a,b)=>a.order-b.order); }
export async function getArticles(): Promise<Article[]> {
  const db = await tryDbArticles(); if (db && db.length) return db;
  return [...data.articles].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}
export function getArticlesSync(): Article[] { return [...data.articles].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)); }
export function getPublished(): Article[] { return getArticlesSync().filter(a=>a.status==='published'); }
export function getArticleBySlug(slug: string) { return getArticlesSync().find(a=>a.slug===slug); }
export function getArticleById(id: string) { return getArticlesSync().find(a=>a.id===id); }
export function searchArticles(q: string) { const s=q.toLowerCase(); return getPublished().filter(a=>(a.title+a.titleEn+a.excerpt+a.content+a.tags.join(' ')).toLowerCase().includes(s)); }
export function relatedArticles(a: Article, n=4) { return getPublished().filter(x=>x.id!==a.id && (x.categorySlug===a.categorySlug || x.tags.some(t=>a.tags.includes(t)))).slice(0,n); }
export function incrementViews(slug: string) { const a=data.articles.find(x=>x.slug===slug); if(a){ a.views=(a.views||0)+1; persist(); } }
export function upsertArticle(a: Article) { const i=data.articles.findIndex(x=>x.id===a.id); if(i>=0) data.articles[i]=a; else data.articles.push(a); persist(); return a; }
export function deleteArticle(id: string) { data.articles=data.articles.filter(x=>x.id!==id); persist(); }
export function upsertCategory(c: Category) { const i=data.categories.findIndex(x=>x.id===c.id); if(i>=0) data.categories[i]=c; else data.categories.push(c); persist(); }
export function deleteCategory(id: string) { data.categories=data.categories.filter(x=>x.id!==id); persist(); }
export function upsertAuthor(a: Author) { const i=data.authors.findIndex(x=>x.id===a.id); if(i>=0) data.authors[i]=a; else data.authors.push(a); persist(); }
export function deleteAuthor(id: string) { data.authors=data.authors.filter(x=>x.id!==id); persist(); }
export function upsertAd(ad: any) { const i=data.ads.findIndex(x=>x.id===ad.id); if(i>=0) data.ads[i]=ad; else data.ads.push(ad); persist(); }
export function deleteAd(id: string) { data.ads=data.ads.filter(x=>x.id!==id); persist(); }
export function addContactMessage(m: any) { data.contactMessages.unshift(m); persist(); return m; }
export function markMessageRead(id: string, read=true) { const m=data.contactMessages.find(x=>x.id===id); if(m) m.read=read; persist(); }
export function deleteMessage(id: string) { data.contactMessages=data.contactMessages.filter(x=>x.id!==id); persist(); }
export function addSubscriber(email: string) { if (data.newsletterSubscribers.some(s=>s.email===email)) return false; data.newsletterSubscribers.push({id:'n'+Date.now(), email, createdAt:new Date().toISOString()}); persist(); return true; }
export function updateSettings(patch: Partial<SeedData['settings']>) { data.settings={...data.settings,...patch}; persist(); }
export function updateSections(sections: SeedData['homepageSections']) { data.homepageSections=sections; persist(); }
export function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9\u0980-\u09FF]+/g,'-').replace(/^-+|-+$/g,'') || ('article-'+Date.now()); }
