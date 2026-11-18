import { NextResponse } from 'next/server'; import { dbStatus, storageStatus, getArticles } from '@/lib/store'; import { adminConfigured } from '@/lib/auth';
// Probes the article source first so dbStatus() reflects a real DB check
// (connected / tables-missing / unreachable) instead of the initial flag.
export async function GET() { const articles = await getArticles(); return NextResponse.json({ database: dbStatus(), storage: storageStatus(), adminConfigured: adminConfigured(), articleCount: articles.length, time: new Date().toISOString() }); }
