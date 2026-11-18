// Seed script: prints the PostgreSQL schema + confirms the JSON seed.
// With DATABASE_URL set, creates tables and loads data/seed.json into Postgres.
// Usage: npm run seed   (requires DATABASE_URL for DB mode)
const fs = require('fs'); const path = require('path');
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'seed.json'), 'utf8'));
console.log(`SP NEWS seed: ${seed.articles.length} SAMPLE articles, ${seed.categories.length} categories, ${seed.authors.length} authors.`);
console.log('All seed articles are labelled SAMPLE (isSample: true).');
if (!process.env.DATABASE_URL) { console.log('DATABASE_URL not set — JSON seed fallback is active; nothing to load into Postgres. Set DATABASE_URL and re-run to seed the database.'); process.exit(0); }
(async () => {
  const { Client } = require('pg');
  const schema = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.ts'), 'utf8').match(/DB_SCHEMA_SQL = `([\s\S]*?)`/)?.[1];
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect(); await client.query(schema);
  for (const c of seed.categories) await client.query('INSERT INTO categories VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [c.id,c.name,c.nameBn,c.slug,c.description,c.color]);
  for (const a of seed.authors) await client.query('INSERT INTO authors VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING', [a.id,a.name,a.nameBn,a.slug,a.role,a.bio,a.avatar]);
  for (const a of seed.articles) await client.query('INSERT INTO articles (id,title,title_en,slug,excerpt,content,category_slug,author_slug,tags,featured_image,gallery,status,featured,breaking,views,published_at,seo_title,seo_description,is_sample) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) ON CONFLICT (id) DO NOTHING', [a.id,a.title,a.titleEn||'',a.slug,a.excerpt,a.content,a.categorySlug,a.authorSlug,a.tags,a.featuredImage,a.gallery,a.status,a.featured,a.breaking,a.views,a.publishedAt,a.seoTitle||'',a.seoDescription||'',true]);
  for (const ad of seed.ads || []) await client.query('INSERT INTO ads VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [ad.id,ad.title,ad.slot,ad.imageUrl,ad.linkUrl,ad.active]);
  await client.query('INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', ['site', JSON.stringify(seed.settings)]);
  for (const s of seed.homepageSections || []) await client.query('INSERT INTO homepage_sections (id,"key",title,title_en,enabled,"order") VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [s.id,s.key,s.title,s.titleEn,s.enabled,s.order]);
  console.log('Seeded PostgreSQL successfully.'); await client.end();
})().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
