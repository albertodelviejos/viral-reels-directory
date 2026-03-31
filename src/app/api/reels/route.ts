import { NextResponse } from 'next/server';
import { fetchReels } from '@/lib/sheets';

export const revalidate = 300; // 5 min cache

export async function GET() {
  try {
    const reels = await fetchReels();
    return NextResponse.json({ reels });
  } catch (error: unknown) {
    console.error('Sheets API error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch reels';
    return NextResponse.json(
      { error: msg, reels: [] },
      { status: 500 }
    );
  }
}
