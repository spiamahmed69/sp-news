// SP NEWS data store.
//
// SOURCE OF TRUTH RULE (this is the fix for "admin news doesn't save"):
// - When DATABASE_URL is set AND the Postgres tables exist, Postgres is the
//   source of truth: every read comes from Postgres and every write goes to
//   Postgres first. Writes await the DB and THROW on failure, so API routes
//   return 500 instead of a fake ok:true.
// - When DATABASE_URL is NOT set, the app runs on the JSON seed
//   (data/seed.json, local dev only). Writes update the in-memory copy and
//   persist back to seed.json — this works locally, but on Vercel the
//   filesystem is read-only/ephemeral, so persist() fails silently there
//   and each serverless instance has its own copy. That is exactly why
//   articles added on Vercel disappeared on refresh.
// - When DATABASE_URL IS set but the tables do not exist yet (migrate has
//   not run), reads fall back to the seed and dbStatus() says so explicitly;
//   run POST /api/admin/migrate (admin only) to create the tables.
// - When DATABASE_URL IS set and the tables exist but are EMPTY, reads
//   return [] — the DB is the source of truth and we must NOT silently
//   fall back to the seed, or a deleted/empty DB would look full of samples.
import fs from 'fs'; import path from 'path';
import seed from '../data/seed.json';
import type { SeedData, Article, Category, Author, Ad, ContactMessage, NewsletterSubscriber, SiteSettings } from './types';
import { getPool, dbPing, DB_SCHEMA_SQL } from './db';

const seedPath = path.join(process.cwd(), 'data', 'seed.json');
// In-memory working copy (JSON-seed fallback only). Kept in sync with DB
// writes so sync readers in the same instance see new rows immediately.
let data: SeedData = JSON.parse(JSON.stringify(seed)) as SeedData;
let dbChecked = false; let dbAvailable = false; let dbTablesMissing = false;
let dbCheckPromise: Promise<boolean> | null = null;

export function dbStatus(): { configured: boolean; connected: boolean; mode: string } {
  const configured = !!process.env.DATABASE_URL;
  const mode = !configured ? 'JSON seed fallback (no DATABASE_URL)'
    : dbTablesMissing ? 'PostgreSQL (tables missing — run POST /api/admin/migrate)'
    : dbAvailable ? 'PostgreSQL' : 'PostgreSQL (unreachable — using JSON fallback)';
  return { configured, connected: configured && dbAvailable && !dbTablesMissing, mode };
}
export function storageStatus(): { blob: boolean; mode: string } {
  const blob = !!process.env.BLOB_READ_WRITE_TOKEN;
  return { blob, mode: blob ? 'Vercel Blob' : 'Local public/uploads' };
}

// One cached connectivity probe per serverless instance. Returns true only
// when the DB answers; never throws.
async function checkDb(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  if (dbChecked) return dbAvailable;
  if (dbCheckPromise) return dbCheckPromise;
  dbCheckPromise = (async () => {
    const ping = await dbPing();
    dbAvailable = ping.ok; dbChecked = true;
    if (!ping.ok) dbTablesMissing = false;
    return dbAvailable;
  })();
  return dbCheckPromise;
}
function isMissingTable(e: any): boolean { return e?.code === '42P01' || /does not exist/i.test(e?.message || ''); }
function markMissingTable() { dbTablesMissing = true; dbAvailable = false; }

// --- Row mappers (pg returns TIMESTAMPTZ as Date) ---
const iso = (v: any): string => (v instanceof Date ? v.toISOString() : (v || new Date().toISOString()));
function mapArticle(r: any): Article {
  return { id: r.id, title: r.title, titleEn: r.titleEn ?? r.title_en ?? '', slug: r.slug, excerpt: r.excerpt || '', content: r.content || '', categorySlug: r.categorySlug ?? r.category_slug ?? '', authorSlug: r.authorSlug ?? r.author_slug ?? '', tags: r.tags || [], featuredImage: r.featuredImage ?? r.featured_image ?? '', gallery: r.gallery || [], status: r.status || 'draft', featured: !!r.featured, breaking: !!r.breaking, views: Number(r.views || 0), publishedAt: iso(r.publishedAt ?? r.published_at), seoTitle: r.seoTitle ?? r.seo_title ?? '', seoDescription: r.seoDescription ?? r.seo_description ?? '', isSample: !!(r.isSample ?? r.is_sample) };
}
function mapCategory(r: any): Category { return { id: r.id, name: r.name, nameBn: r.nameBn ?? r.name_bn ?? r.name, slug: r.slug, description: r.description || '', color: r.color || '#C8102E' }; }
function mapAuthor(r: any): Author { return { id: r.id, name: r.name, nameBn: r.nameBn ?? r.name_bn ?? r.name, slug: r.slug, role: r.role || '', bio: r.bio || '', avatar: r.avatar || '' }; }
function mapAd(r: any): Ad { return { id: r.id, title: r.title, slot: r.slot, imageUrl: r.imageUrl ?? r.image_url ?? '', linkUrl: r.linkUrl ?? r.link_url ?? '#', active: r.active !== false }; }
function mapMessage(r: any): ContactMessage { return { id: r.id, name: r.name, email: r.email, subject: r.subject || '', message: r.message, createdAt: iso(r.createdAt ?? r.created_at), read: !!r.read }; }
function mapSubscriber(r: any): NewsletterSubscriber { return { id: r.id, email: r.email, createdAt: iso(r.createdAt ?? r.created_at) }; }
type Section = SeedData['homepageSections'][number];
function mapSection(r: any): Section { return { id: r.id, key: r.key, title: r.title, titleEn: r.titleEn ?? r.title_en ?? '', enabled: !!r.enabled, order: Number(r.order ?? 0) }; }

// --- Generic DB read: returns rows, null when DB is not usable, and
// --- throws nothing. `emptyOk` is always true: an existing empty table is
// --- a real answer ([]) and must NOT trigger a seed fallback.
async function dbQuery<T>(sql: string, params: any[], map: (r: any) => T): Promise<T[] | null> {
  const pool = getPool(); if (!pool) return null;
  if (!(await checkDb())) return null;
  try {
    const r = await pool.query(sql, params);
    dbAvailable = true; dbTablesMissing = false;
    return r.rows.map(map);
  } catch (e) {
    if (isMissingTable(e)) markMissingTable(); else dbAvailable = false;
    return null;
  }
}
async function dbExec(sql: string, params: any[]): Promise<void> {
  const pool = getPool(); if (!pool) throw new Error('DATABASE_URL is not set — cannot write to Postgres');
  if (!(await checkDb())) throw new Error('Database is unreachable — write was NOT saved. Check DATABASE_URL and run POST /api/admin/migrate.');
  try { await pool.query(sql, params); dbAvailable = true; }
  catch (e: any) {
    if (isMissingTable(e)) { markMissingTable(); throw new Error('Database tables do not exist yet — run POST /api/admin/migrate first. Write was NOT saved.'); }
    throw new Error('Database write failed: ' + (e?.message || 'unknown error') + ' — write was NOT saved.');
  }
}

// --- Migration + seeding (admin only, via /api/admin/migrate) ---
export async function migrateDb(): Promise<{ created: boolean; seeded: { articles: number; categories: number; authors: number; ads: number }; counts: { articles: number; categories: number; authors: number } }> {
  const pool = getPool(); if (!pool) throw new Error('DATABASE_URL is not set — cannot migrate. Set DATABASE_URL in Vercel first.');
  if (!(await checkDb())) throw new Error('Database is unreachable — check DATABASE_URL.');
  await pool.query(DB_SCHEMA_SQL);
  dbTablesMissing = false; dbAvailable = true;
  const count = async (t: string) => Number((await pool.query(`SELECT COUNT(*) FROM ${t}`)).rows[0].count);
  const before = { articles: await count('articles'), categories: await count('categories'), authors: await count('authors') };
  const seeded = { articles: 0, categories: 0, authors: 0, ads: 0 };
  // Seed ONLY when the articles table is empty — idempotent, never overwrites real news.
  if (before.articles === 0) {
    for (const c of data.categories) { await pool.query('INSERT INTO categories (id,name,name_bn,slug,description,color) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [c.id, c.name, c.nameBn, c.slug, c.description || '', c.color || '#C8102E']); }
    for (const a of data.authors) { await pool.query('INSERT INTO authors (id,name,name_bn,slug,role,bio,avatar) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING', [a.id, a.name, a.nameBn, a.slug, a.role, a.bio || '', a.avatar || '']); }
    for (const a of data.articles) { await pool.query('INSERT INTO articles (id,title,title_en,slug,excerpt,content,category_slug,author_slug,tags,featured_image,gallery,status,featured,breaking,views,published_at,seo_title,seo_description,is_sample) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) ON CONFLICT (id) DO NOTHING', [a.id, a.title, a.titleEn || '', a.slug, a.excerpt, a.content, a.categorySlug, a.authorSlug, a.tags, a.featuredImage, a.gallery, a.status, a.featured, a.breaking, a.views, a.publishedAt, a.seoTitle || '', a.seoDescription || '', true]); seeded.articles++; }
    for (const ad of data.ads) { await pool.query('INSERT INTO ads (id,title,slot,image_url,link_url,active) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [ad.id, ad.title, ad.slot, ad.imageUrl, ad.linkUrl, ad.active]); seeded.ads++; }
    await pool.query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', ['site', JSON.stringify(data.settings)]);
    for (const s of data.homepageSections) { await pool.query('INSERT INTO homepage_sections (id,"key",title,title_en,enabled,"order") VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [s.id, s.key, s.title, s.titleEn, s.enabled, s.order]); }
    seeded.categories = data.categories.length; seeded.authors = data.authors.length;
  }
  const after = { articles: await count('articles'), categories: await count('categories'), authors: await count('authors') };
  return { created: true, seeded, counts: after };
}

// --- Local JSON fallback persistence (local dev only; silent on Vercel) ---
function persist() { try { fs.writeFileSync(seedPath, JSON.stringify(data, null, 2)); } catch {} }
function syncFromDb(a: Article) { const i = data.articles.findIndex(x => x.id === a.id); if (i >= 0) data.articles[i] = a; else data.articles.push(a); }

// --- Async (DB-first) reads — use these in pages and API routes ---
export async function getArticles(): Promise<Article[]> {
  const db = await dbQuery('SELECT id,title,title_en AS "titleEn",slug,excerpt,content,category_slug AS "categorySlug",author_slug AS "authorSlug",tags,featured_image AS "featuredImage",gallery,status,featured,breaking,views,published_at AS "publishedAt",seo_title AS "seoTitle",seo_description AS "seoDescription",is_sample AS "isSample" FROM articles ORDER BY published_at DESC', [], mapArticle);
  if (db !== null) return db; // DB is source of truth — even when empty
  return [...data.articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export async function getPublished(): Promise<Article[]> { return (await getArticles()).filter(a => a.status === 'published'); }
export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const decoded = decodeSlug(slug);
  const db = await dbQuery('SELECT id,title,title_en AS "titleEn",slug,excerpt,content,category_slug AS "categorySlug",author_slug AS "authorSlug",tags,featured_image AS "featuredImage",gallery,status,featured,breaking,views,published_at AS "publishedAt",seo_title AS "seoTitle",seo_description AS "seoDescription",is_sample AS "isSample" FROM articles WHERE slug=$1', [decoded], mapArticle);
  if (db !== null) return db[0];
  return data.articles.find(a => a.slug === decoded);
}
export async function getArticleById(id: string): Promise<Article | undefined> {
  const db = await dbQuery('SELECT id,title,title_en AS "titleEn",slug,excerpt,content,category_slug AS "categorySlug",author_slug AS "authorSlug",tags,featured_image AS "featuredImage",gallery,status,featured,breaking,views,published_at AS "publishedAt",seo_title AS "seoTitle",seo_description AS "seoDescription",is_sample AS "isSample" FROM articles WHERE id=$1', [id], mapArticle);
  if (db !== null) return db[0];
  return data.articles.find(a => a.id === id);
}
export async function searchArticles(q: string): Promise<Article[]> {
  const s = q.toLowerCase();
  return (await getPublished()).filter(a => (a.title + a.titleEn + a.excerpt + a.content + a.tags.join(' ')).toLowerCase().includes(s));
}
export async function relatedArticles(a: Article, n = 4): Promise<Article[]> {
  return (await getPublished()).filter(x => x.id !== a.id && (x.categorySlug === a.categorySlug || x.tags.some(t => a.tags.includes(t)))).slice(0, n);
}
export async function getCategories(): Promise<Category[]> {
  const db = await dbQuery('SELECT id,name,name_bn AS "nameBn",slug,description,color FROM categories ORDER BY id', [], mapCategory);
  return db !== null ? db : data.categories;
}
export async function getCategory(slug: string): Promise<Category | undefined> { const d = decodeSlug(slug); return (await getCategories()).find(c => c.slug === d); }
export async function getAuthors(): Promise<Author[]> {
  const db = await dbQuery('SELECT id,name,name_bn AS "nameBn",slug,role,bio,avatar FROM authors ORDER BY id', [], mapAuthor);
  return db !== null ? db : data.authors;
}
export async function getAuthor(slug: string): Promise<Author | undefined> { const d = decodeSlug(slug); return (await getAuthors()).find(a => a.slug === d); }
export async function getAds(slot?: string): Promise<Ad[]> { return (await getAllAds()).filter(a => a.active && (!slot || a.slot === slot)); }
export async function getAllAds(): Promise<Ad[]> {
  const db = await dbQuery('SELECT id,title,slot,image_url AS "imageUrl",link_url AS "linkUrl",active FROM ads ORDER BY id', [], mapAd);
  return db !== null ? db : data.ads;
}
export async function getSettings(): Promise<SiteSettings> {
  const pool = getPool();
  if (pool && await checkDb()) {
    try { const r = await pool.query("SELECT value FROM settings WHERE key='site'"); if (r.rows[0]) return { ...data.settings, ...(r.rows[0].value as SiteSettings) }; } catch { /* fall through to seed */ }
  }
  return data.settings;
}
export async function getSections(): Promise<Section[]> {
  const db = await dbQuery('SELECT id,"key",title,title_en AS "titleEn",enabled,"order" FROM homepage_sections ORDER BY "order"', [], mapSection);
  return db !== null ? db : [...data.homepageSections].sort((a, b) => a.order - b.order);
}
export async function getContactMessages(): Promise<ContactMessage[]> {
  const db = await dbQuery('SELECT id,name,email,subject,message,created_at AS "createdAt",read FROM contact_messages ORDER BY created_at DESC', [], mapMessage);
  return db !== null ? db : [...data.contactMessages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function getSubscribers(): Promise<NewsletterSubscriber[]> {
  const db = await dbQuery('SELECT id,email,created_at AS "createdAt" FROM newsletter_subscribers ORDER BY created_at DESC', [], mapSubscriber);
  return db !== null ? db : data.newsletterSubscribers;
}
export function getUsers() { return data.users; }

// --- Sync (JSON-fallback) reads — local dev / seed-only surfaces only ---
export function getArticlesSync(): Article[] { return [...data.articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)); }
export function getPublishedSync(): Article[] { return getArticlesSync().filter(a => a.status === 'published'); }
export function getArticleBySlugSync(slug: string) { return data.articles.find(a => a.slug === decodeSlug(slug)); }
export function getArticleByIdSync(id: string) { return data.articles.find(a => a.id === id); }
export function getCategoriesSync(): Category[] { return data.categories; }
export function getAuthorsSync(): Author[] { return data.authors; }
export function getSettingsSync(): SiteSettings { return data.settings; }

// --- Async (DB-first) writes — throw on DB failure; never fake success ---
export async function upsertArticle(a: Article): Promise<Article> {
  if (getPool()) {
    await dbExec('INSERT INTO articles (id,title,title_en,slug,excerpt,content,category_slug,author_slug,tags,featured_image,gallery,status,featured,breaking,views,published_at,seo_title,seo_description,is_sample) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,title_en=EXCLUDED.title_en,slug=EXCLUDED.slug,excerpt=EXCLUDED.excerpt,content=EXCLUDED.content,category_slug=EXCLUDED.category_slug,author_slug=EXCLUDED.author_slug,tags=EXCLUDED.tags,featured_image=EXCLUDED.featured_image,gallery=EXCLUDED.gallery,status=EXCLUDED.status,featured=EXCLUDED.featured,breaking=EXCLUDED.breaking,views=EXCLUDED.views,published_at=EXCLUDED.published_at,seo_title=EXCLUDED.seo_title,seo_description=EXCLUDED.seo_description,is_sample=EXCLUDED.is_sample',
      [a.id, a.title, a.titleEn || '', a.slug, a.excerpt, a.content, a.categorySlug, a.authorSlug, a.tags, a.featuredImage, a.gallery, a.status, a.featured, a.breaking, a.views || 0, a.publishedAt, a.seoTitle || '', a.seoDescription || '', !!a.isSample]);
  }
  syncFromDb(a); persist(); return a;
}
export async function deleteArticle(id: string): Promise<void> {
  if (getPool()) await dbExec('DELETE FROM articles WHERE id=$1', [id]);
  data.articles = data.articles.filter(x => x.id !== id); persist();
}
export async function incrementViews(slug: string): Promise<void> {
  if (getPool() && await checkDb()) { try { await getPool()!.query('UPDATE articles SET views=views+1 WHERE slug=$1', [slug]); } catch { /* views are best-effort */ } }
  const a = data.articles.find(x => x.slug === slug); if (a) { a.views = (a.views || 0) + 1; persist(); }
}
export async function upsertCategory(c: Category): Promise<Category> {
  if (getPool()) await dbExec('INSERT INTO categories (id,name,name_bn,slug,description,color) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,name_bn=EXCLUDED.name_bn,slug=EXCLUDED.slug,description=EXCLUDED.description,color=EXCLUDED.color', [c.id, c.name, c.nameBn, c.slug, c.description || '', c.color || '#C8102E']);
  const i = data.categories.findIndex(x => x.id === c.id); if (i >= 0) data.categories[i] = c; else data.categories.push(c); persist(); return c;
}
export async function deleteCategory(id: string): Promise<void> {
  if (getPool()) await dbExec('DELETE FROM categories WHERE id=$1', [id]);
  data.categories = data.categories.filter(x => x.id !== id); persist();
}
export async function upsertAuthor(a: Author): Promise<Author> {
  if (getPool()) await dbExec('INSERT INTO authors (id,name,name_bn,slug,role,bio,avatar) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,name_bn=EXCLUDED.name_bn,slug=EXCLUDED.slug,role=EXCLUDED.role,bio=EXCLUDED.bio,avatar=EXCLUDED.avatar', [a.id, a.name, a.nameBn, a.slug, a.role, a.bio || '', a.avatar || '']);
  const i = data.authors.findIndex(x => x.id === a.id); if (i >= 0) data.authors[i] = a; else data.authors.push(a); persist(); return a;
}
export async function deleteAuthor(id: string): Promise<void> {
  if (getPool()) await dbExec('DELETE FROM authors WHERE id=$1', [id]);
  data.authors = data.authors.filter(x => x.id !== id); persist();
}
export async function upsertAd(ad: Ad): Promise<Ad> {
  if (getPool()) await dbExec('INSERT INTO ads (id,title,slot,image_url,link_url,active) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,slot=EXCLUDED.slot,image_url=EXCLUDED.image_url,link_url=EXCLUDED.link_url,active=EXCLUDED.active', [ad.id, ad.title, ad.slot, ad.imageUrl, ad.linkUrl, ad.active]);
  const i = data.ads.findIndex(x => x.id === ad.id); if (i >= 0) data.ads[i] = ad; else data.ads.push(ad); persist(); return ad;
}
export async function deleteAd(id: string): Promise<void> {
  if (getPool()) await dbExec('DELETE FROM ads WHERE id=$1', [id]);
  data.ads = data.ads.filter(x => x.id !== id); persist();
}
export async function addContactMessage(m: ContactMessage): Promise<ContactMessage> {
  if (getPool()) await dbExec('INSERT INTO contact_messages (id,name,email,subject,message,created_at,read) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING', [m.id, m.name, m.email, m.subject || '', m.message, m.createdAt, !!m.read]);
  data.contactMessages.unshift(m); persist(); return m;
}
export async function markMessageRead(id: string, read = true): Promise<void> {
  if (getPool()) await dbExec('UPDATE contact_messages SET read=$2 WHERE id=$1', [id, read]);
  const m = data.contactMessages.find(x => x.id === id); if (m) m.read = read; persist();
}
export async function deleteMessage(id: string): Promise<void> {
  if (getPool()) await dbExec('DELETE FROM contact_messages WHERE id=$1', [id]);
  data.contactMessages = data.contactMessages.filter(x => x.id !== id); persist();
}
export async function addSubscriber(email: string): Promise<boolean> {
  if (data.newsletterSubscribers.some(s => s.email === email)) {
    if (getPool()) { const r = await dbQuery('SELECT id FROM newsletter_subscribers WHERE email=$1', [email], (x: any) => x); if (r && r.length) return false; }
    else return false;
  }
  const sub: NewsletterSubscriber = { id: 'n' + Date.now(), email, createdAt: new Date().toISOString() };
  if (getPool()) await dbExec('INSERT INTO newsletter_subscribers (id,email,created_at) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING', [sub.id, sub.email, sub.createdAt]);
  data.newsletterSubscribers.push(sub); persist(); return true;
}
export async function updateSettings(patch: Partial<SiteSettings>): Promise<void> {
  data.settings = { ...data.settings, ...patch };
  if (getPool()) await dbExec('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value', ['site', JSON.stringify(data.settings)]);
  persist();
}
export async function updateSections(sections: Section[]): Promise<void> {
  data.homepageSections = sections;
  if (getPool()) {
    for (const s of sections) await dbExec('INSERT INTO homepage_sections (id,"key",title,title_en,enabled,"order") VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET "key"=EXCLUDED."key",title=EXCLUDED.title,title_en=EXCLUDED.title_en,enabled=EXCLUDED.enabled,"order"=EXCLUDED."order"', [s.id, s.key, s.title, s.titleEn, s.enabled, s.order]);
  }
  persist();
}
// Next.js 14 passes dynamic route params still percent-encoded (e.g. a
// Bengali slug arrives as %E0%A6%A2...), so decode before comparing.
export function decodeSlug(s: string): string { try { return decodeURIComponent(s); } catch { return s; } }
export function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') || ('article-' + Date.now()); }
