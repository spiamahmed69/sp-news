import { NextResponse } from 'next/server'; import { dbStatus, storageStatus } from '@/lib/store'; import { adminConfigured } from '@/lib/auth';
export async function GET() { return NextResponse.json({ database: dbStatus(), storage: storageStatus(), adminConfigured: adminConfigured(), time: new Date().toISOString() }); }
