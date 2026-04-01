import { NextResponse } from 'next/server';
import { updateItem, deleteItem, STAGES } from '@/lib/pipeline-db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { stage, notes, priority } = body;

    if (stage !== undefined && !STAGES.includes(stage)) {
      return NextResponse.json({ error: `Invalid stage. Must be one of: ${STAGES.join(', ')}` }, { status: 400 });
    }

    const item = updateItem(id, { stage, notes, priority });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (e) {
    console.error('Pipeline PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const deleted = deleteItem(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Pipeline DELETE error:', e);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
