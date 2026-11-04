import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!secret || !supplied) return false;
  const expectedBytes = Buffer.from(secret);
  const suppliedBytes = Buffer.from(supplied);
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    const { data, error } = await createAdminClient().rpc('release_abandoned_stock');
    if (error) {
      console.error('Abandoned order release failed:', error.message);
      return NextResponse.json({ error: 'Could not release abandoned stock.' }, { status: 500 });
    }
    return NextResponse.json({ releasedOrders: data ?? 0 });
  } catch (error) {
    console.error('Abandoned order cron failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not release abandoned stock.' }, { status: 500 });
  }
}
