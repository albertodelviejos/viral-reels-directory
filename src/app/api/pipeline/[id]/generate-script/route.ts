import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { updateItem, getItemById } from '@/lib/pipeline-db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const item = await getItemById(id);
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const prompt = `Eres un guionista experto en contenido viral de Instagram/TikTok/YouTube Shorts.

Genera un guión completo para un video corto (30-60 segundos) basado en esta referencia viral:

**Referencia viral:**
- Creador original: ${item.handle}
- Hook/Tema: ${item.hook}
- Formato que usó: ${item.format || 'No especificado'}
- Categoría: ${item.category || 'No especificada'}
- Tipo: ${item.tipo || 'Reel'}
- Views originales: ${item.views || 'N/A'}

**Context:** The video is for Alberto (@albertodviejo), a content creator focused on AI, automation, and technology. The script should be adapted to his style and English-speaking audience.

${item.notes ? `**Creator notes:** ${item.notes}` : ''}

**Generate the script with this structure:**

## SCRIPT

### Hook (0-3s)
[Opening line that hooks immediately]

### Body (3-25s)
[Main content, step by step or story]

### CTA / Closing (25-30s)
[Strong call to action or closing line]

---

### Production Notes
- **Visual style:** [editing suggestions]
- **Music/SFX:** [recommendations]
- **On-screen text:** [suggested overlays]
- **Hashtags:** [5-8 relevant hashtags]

Write EVERYTHING in English.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const script = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    const updated = await updateItem(id, { script, stage: 'guion' });

    return NextResponse.json({ script, item: updated });
  } catch (error: unknown) {
    console.error('Script generation error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to generate script';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
