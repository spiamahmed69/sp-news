# SP NEWS — প্রিমিয়াম বাংলাদেশি ডিজিটাল সংবাদপত্র

Next.js 14 (App Router) + React + TypeScript + Tailwind CSS দিয়ে তৈরি সম্পূর্ণ ডিজিটাল সংবাদপত্র। বাংলা টাইপোগ্রাফি (Noto Serif/Sans Bengali), লাইট/ডার্ক মোড, SEO, অ্যাডমিন প্যানেল সহ।

## বৈশিষ্ট্য
- হোমপেজ: ব্রেকিং টিকার, ফিচার্ড সংবাদ, সর্বশেষ, ট্রেন্ডিং, সর্বাধিক পঠিত, সম্পাদকের পছন্দ, ৯টি বিভাগ, ফটো গ্যালারি, ভিডিও সংবাদ, বিজ্ঞাপন স্লট, নিউজলেটার
- পৃষ্ঠা: `/news/[slug]`, `/category/[slug]`, `/search?q=`, `/latest`, `/trending`, `/author/[slug]`, `/about`, `/contact`, `/privacy`, `/terms`, `/editorial-policy`, কাস্টম 404
- অ্যাডমিন (`/admin`): ড্যাশবোর্ড অ্যানালিটিক্স, সংবাদ CRUD (বাংলা+ইংরেজি শিরোনাম, রিচ-টেক্সট এডিটর, ফিচার্ড ছবি আপলোড, গ্যালারি, SEO, ফিচার্ড/ব্রেকিং, ড্রাফট/প্রকাশিত/নির্ধারিত), বিভাগ, লেখক, ব্যবহারকারী/ভূমিকা, ছবি লাইব্রেরি, বিজ্ঞাপন, হোমপেজ সেকশন, SEO/সাইট সেটিংস, যোগাযোগ বার্তা
- ডাটাবেস: PostgreSQL (`DATABASE_URL` সেট থাকলে)। না থাকলে JSON সিড ফলব্যাক (`data/seed.json`) দিয়ে অ্যাপ চলে — অ্যাডমিন ড্যাশবোর্ড ও `/api/status`-এ ডাটাবেস স্ট্যাটাস স্পষ্টভাবে দেখায়, সংযুক্ত না থাকলে সংযুক্ত বলে ভান করে না।
- ছবি: `BLOB_READ_WRITE_TOKEN` সেট থাকলে Vercel Blob, না থাকলে `public/uploads` (স্ট্যাটাস অ্যাডমিনে দেখায়)।
- নিরাপত্তা: bcryptjs পাসওয়ার্ড হ্যাশ, সেশন-কুকি অ্যাডমিন অথ (সার্ভার-সাইড সুরক্ষা, middleware), লগইন/নিউজলেটার/যোগাযোগ API-তে রেট লিমিটিং।

## দ্রুত শুরু
```bash
npm install
cp .env.example .env.local   # মানগুলো বসান (নিচে দেখুন)
npm run dev                  # http://localhost:3000
npm run build && npm start   # প্রোডাকশন
npm run seed                 # DATABASE_URL সেট থাকলে Postgres-এ সিড লোড করে
```

## অ্যাডমিন সেটআপ (প্রথমবার)
1. পাসওয়ার্ড হ্যাশ তৈরি করুন:
```bash
node -e "console.log(require('bcryptjs').hashSync('আপনার-পাসওয়ার্ড', 10))"
```
2. `.env.local`-এ বসান:
```
ADMIN_EMAIL=admin@spnews.com.bd
ADMIN_PASSWORD_HASH=\$2a\$10\$...  # গুরুত্বপূর্ণ: হ্যাশের প্রতিটি $ এর আগে \ বসান (যেমন \$2a\$10\$...) — Next.js-এর env লোডার না হলে $... অংশ কেটে ফেলে এবং লগইন ব্যর্থ হয়
SESSION_SECRET=<দীর্ঘ র‍্যান্ডম স্ট্রিং>
```
3. `http://localhost:3000/admin/login`-এ লগইন করুন।

## এনভায়রনমেন্ট ভেরিয়েবল
| নাম | বাধ্যতামূলক? | কাজ |
|---|---|---|
| `DATABASE_URL` | না | PostgreSQL সংযোগ; না থাকলে JSON ফলব্যাক |
| `ADMIN_EMAIL` | অ্যাডমিনের জন্য | অ্যাডমিন ইমেইল |
| `ADMIN_PASSWORD_HASH` | অ্যাডমিনের জন্য | bcryptjs হ্যাশ (উপরে দেখুন) |
| `BLOB_READ_WRITE_TOKEN` | না | Vercel Blob; না থাকলে local uploads |
| `SESSION_SECRET` / `NEXTAUTH_SECRET` | না | সেশন কুকি সাইনিং |
| `NEXT_PUBLIC_SITE_URL` | না | SEO/sitemap-এর বেস URL (ডিফল্ট localhost:3000) |

## নমুনা ডেটা
`data/seed.json`-এর সব সংবাদ স্পষ্টভাবে SAMPLE হিসেবে চিহ্নিত (`isSample: true`, কার্ডে "SAMPLE" ব্যাজ)। আসল সংবাদ অ্যাডমিন থেকে যোগ করুন।

## API
- `GET /api/articles?q=&category=` — সংবাদের তালিকা
- `POST /api/newsletter` `{email}` — সাবস্ক্রাইব
- `POST /api/contact` `{name,email,subject,message}` — বার্তা সংরক্ষণ
- `POST /api/auth/login` / `POST /api/auth/logout`
- `GET /api/status` — ডাটাবেস/স্টোরেজ/অ্যাডমিন স্ট্যাটাস
- `GET/POST/DELETE /api/admin/articles| categories | authors | ads | settings | messages | sections` (অ্যাডমিন কুকি প্রয়োজন)
- `POST /api/upload` (multipart `file`, অ্যাডমিন কুকি প্রয়োজন)
