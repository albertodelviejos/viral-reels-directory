import { NextResponse } from 'next/server';
import { getAllItems, addItem } from '@/lib/pipeline-db';

export async function GET() {
  try {
    const items = getAllItems();
    return NextResponse.json({ items });
  } catch (e) {
    console.error('Pipeline GET error:', e);
    return NextResponse.json({ error: 'Failed to fetch pipeline items', items: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reel_link, handle, hook, format, category, tipo, views } = body;

    if (!reel_link || !handle || !hook) {
      return NextResponse.json({ error: 'reel_link, handle, and hook are required' }, { status: 400 });
    }

    const item = addItem({ reel_link, handle, hook, format, category, tipo, views });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'This reel is already in the pipeline' }, { status: 409 });
    }
    console.error('Pipeline POST error:', e);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
