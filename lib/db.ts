// PostgreSQL layer (optional). When DATABASE_URL is not set, returns null and
// callers fall back to the JSON seed — never pretend the DB is connected.
import { Pool } from 'pg';
let pool: Pool | null = null;
export function dbConfigured(): boolean { return !!process.env.DATABASE_URL; }
export function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  return pool;
}
export async function dbPing(): Promise<{ ok: boolean; error?: string }> {
  const p = getPool(); if (!p) return { ok: false, error: 'DATABASE_URL is not set' };
  try { await p.query('SELECT 1'); return { ok: true }; } catch (e:any) { return { ok: false, error: e?.message || 'DB connection failed' }; }
}
export const DB_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name TEXT, name_bn TEXT, slug TEXT UNIQUE, description TEXT, color TEXT);
CREATE TABLE IF NOT EXISTS authors (id TEXT PRIMARY KEY, name TEXT, name_bn TEXT, slug TEXT UNIQUE, role TEXT, bio TEXT, avatar TEXT);
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, role TEXT, password_hash TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, title TEXT, title_en TEXT, slug TEXT UNIQUE, excerpt TEXT, content TEXT, category_slug TEXT, author_slug TEXT, tags TEXT[], featured_image TEXT, gallery TEXT[], status TEXT, featured BOOLEAN DEFAULT FALSE, breaking BOOLEAN DEFAULT FALSE, views INT DEFAULT 0, published_at TIMESTAMPTZ, seo_title TEXT, seo_description TEXT, is_sample BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSONB);
CREATE TABLE IF NOT EXISTS ads (id TEXT PRIMARY KEY, title TEXT, slot TEXT, image_url TEXT, link_url TEXT, active BOOLEAN DEFAULT TRUE);
CREATE TABLE IF NOT EXISTS contact_messages (id TEXT PRIMARY KEY, name TEXT, email TEXT, subject TEXT, message TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), read BOOLEAN DEFAULT FALSE);
CREATE TABLE IF NOT EXISTS newsletter_subscribers (id TEXT PRIMARY KEY, email TEXT UNIQUE, created_at TIMESTAMPTZ DEFAULT NOW());
`;
